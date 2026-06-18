/**
 * DeliveryMap — Leaflet map mô phỏng giao hàng.
 *
 * PERFORMANCE OPTIMIZATIONS:
 * 1. Module-level map cache: map instance + DOM container survive component
 *    unmount → navigate away + come back = instant, no tile reload
 * 2. CartoDB Positron tiles: fast global CDN, no API key needed, cleaner style
 * 3. Separate layer groups: staticLayerRef (cleared on redraw) vs shipperLayerRef
 *    (never cleared) — prevents shipper marker from being destroyed by route redraws
 * 4. updateTraveledPath takes explicit args — no stale closure risk
 * 5. Partial coordinate handling: map still shows if only seller OR buyer coord available
 */
import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface DeliveryMapProps {
  /** Stable unique ID for this map instance (e.g., orderId). Used for caching. */
  mapId: string
  sellerLat: number | null | undefined
  sellerLng: number | null | undefined
  shippingLat: number | null | undefined
  shippingLng: number | null | undefined
  orderStatus: string
  sellerName?: string
  shippingName?: string
  className?: string
}

// ─── Module-level cache ───────────────────────────────────────────────────────
// Keeps Leaflet map alive across React unmount/remount cycles.
// Key = mapId (orderId), value = cached map context.
interface MapCache {
  container: HTMLDivElement      // The real Leaflet DOM container (kept alive)
  map: L.Map
  staticLayer: L.LayerGroup
  shipperLayer: L.LayerGroup
  routeCoords: [number, number][]
}

const _mapCache = new Map<string, MapCache>()

/** Cleanup stale cache entries (keep at most 3 maps in memory) */
function pruneCacheIfNeeded(currentId: string) {
  if (_mapCache.size <= 3) return
  for (const [id, cache] of _mapCache.entries()) {
    if (id !== currentId) {
      cache.map.remove()
      _mapCache.delete(id)
      break
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function positionForStatus(
  status: string,
  sellerLat: number, sellerLng: number,
  shippingLat: number, shippingLng: number,
  routeCoords: [number, number][],
): [number, number] {
  switch (status) {
    case "pending":
    case "cancelled":
      return [sellerLat, sellerLng]
    case "shipping": {
      if (routeCoords.length > 0) {
        const idx = Math.floor(routeCoords.length * 0.4)
        return routeCoords[idx] ?? [sellerLat, sellerLng]
      }
      return [
        sellerLat + (shippingLat - sellerLat) * 0.4,
        sellerLng + (shippingLng - sellerLng) * 0.4,
      ]
    }
    case "delivered":
    case "completed":
    case "returning":
    case "returned":
    default:
      return [shippingLat, shippingLng]
  }
}

function shipperLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Chờ giao hàng",
    shipping: "Đang vận chuyển",
    delivered: "Đã giao hàng",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
    disputed: "Đang khiếu nại",
    returning: "Đang hoàn trả",
    returned: "Đã hoàn trả",
  }
  return labels[status] ?? ""
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function routeProgress(
  progress: number,
  routeCoords: [number, number][],
  sLat: number, sLng: number,
  bLat: number, bLng: number,
): [number, number] {
  const p = Math.min(progress, 1)
  if (routeCoords.length >= 2) {
    const idx = Math.floor(routeCoords.length * p)
    return routeCoords[Math.min(idx, routeCoords.length - 1)]
  }
  return [sLat + (bLat - sLat) * p, sLng + (bLng - sLng) * p]
}

function createShipperIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;width:40px;height:40px;align-items:center;justify-content:center;border-radius:50%;background:#10B981;box-shadow:0 4px 14px rgba(16,185,129,0.5);border:3px solid white;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  })
}

/** Resolve effective coords when one side may be null */
function resolveCoords(
  sellerLat: number | null | undefined, sellerLng: number | null | undefined,
  shippingLat: number | null | undefined, shippingLng: number | null | undefined,
): { sLat: number; sLng: number; bLat: number; bLng: number } | null {
  const sv = sellerLat != null && sellerLng != null
  const bv = shippingLat != null && shippingLng != null
  if (!sv && !bv) return null
  return {
    sLat: sellerLat ?? shippingLat!,
    sLng: sellerLng ?? shippingLng!,
    bLat: shippingLat ?? sellerLat!,
    bLng: shippingLng ?? sellerLng!,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeliveryMap({
  mapId,
  sellerLat, sellerLng,
  shippingLat, shippingLng,
  orderStatus,
  sellerName, shippingName,
  className,
}: DeliveryMapProps) {
  /** Outer wrapper div — always mounted, acts as viewport for the cached container */
  const wrapperRef = useRef<HTMLDivElement>(null)

  const shipperRef = useRef<L.Marker | null>(null)
  const traveledLineRef = useRef<L.Polyline | null>(null)
  const prevStatusRef = useRef<string>(orderStatus)
  const animFrameRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // routeCoords is kept in React state for effect deps, but ALSO synced into cache
  const [routeCoords, setRouteCoords] = useState<[number, number][]>(() => {
    return _mapCache.get(mapId)?.routeCoords ?? []
  })

  // ─── 1. Mount/unmount: attach or create map ─────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    pruneCacheIfNeeded(mapId)

    let cache = _mapCache.get(mapId)

    if (cache) {
      // Re-attach existing container into this wrapper
      wrapper.appendChild(cache.container)
      cache.map.invalidateSize()
      // Restore refs
      shipperRef.current = cache.shipperLayer.getLayers().find(
        (l) => l instanceof L.Marker
      ) as L.Marker ?? null
      traveledLineRef.current = cache.shipperLayer.getLayers().find(
        (l) => l instanceof L.Polyline
      ) as L.Polyline ?? null
      setRouteCoords(cache.routeCoords)
    } else {
      // Create brand new map in a detached container
      const container = document.createElement("div")
      container.style.width = "100%"
      container.style.height = "100%"
      wrapper.appendChild(container)

      const map = L.map(container, {
        zoomControl: true,
        attributionControl: true,
      }).setView([21.0285, 105.8542], 6)

      // CartoDB Positron — fast global CDN, clean style, no API key
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map)

      const staticLayer = L.layerGroup().addTo(map)
      const shipperLayer = L.layerGroup().addTo(map)

      cache = { container, map, staticLayer, shipperLayer, routeCoords: [] }
      _mapCache.set(mapId, cache)
    }

    return () => {
      // Detach container from wrapper — DON'T call map.remove()
      // The container lives on in _mapCache until pruned
      if (cache && wrapper.contains(cache.container)) {
        wrapper.removeChild(cache.container)
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      abortRef.current?.abort()
    }
  }, [mapId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 2. Fetch OSRM route when coordinates change ────────────────
  useEffect(() => {
    abortRef.current?.abort()

    if (!sellerLat || !sellerLng || !shippingLat || !shippingLng) {
      setRouteCoords([])
      const c = _mapCache.get(mapId)
      if (c) c.routeCoords = []
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    const url =
      `https://router.project-osrm.org/route/v1/driving/${sellerLng},${sellerLat};${shippingLng},${shippingLat}?geometries=geojson&overview=full`

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (controller.signal.aborted) return
        const raw = data.routes?.[0]?.geometry?.coordinates
        const coords: [number, number][] = raw
          ? raw.map((c: number[]) => [c[1], c[0]] as [number, number])
          : []
        setRouteCoords(coords)
        const cache = _mapCache.get(mapId)
        if (cache) cache.routeCoords = coords
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setRouteCoords([])
          const c = _mapCache.get(mapId)
          if (c) c.routeCoords = []
        }
      })

    return () => controller.abort()
  }, [sellerLat, sellerLng, shippingLat, shippingLng, mapId])

  // ─── 3. Static layers: seller + buyer markers + full gray route ──
  useEffect(() => {
    const cache = _mapCache.get(mapId)
    if (!cache) return
    const { map, staticLayer } = cache

    staticLayer.clearLayers()

    const sv = sellerLat != null && sellerLng != null
    const bv = shippingLat != null && shippingLng != null
    if (!sv && !bv) return

    if (sv) {
      L.circleMarker([sellerLat!, sellerLng!], {
        radius: 10,
        fillColor: "#2563EB",
        color: "#fff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .addTo(staticLayer)
        .bindPopup(sellerName || "Người bán")
    }

    if (bv) {
      L.circleMarker([shippingLat!, shippingLng!], {
        radius: 10,
        fillColor: "#EF4444",
        color: "#fff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .addTo(staticLayer)
        .bindPopup(shippingName || "Người mua")
    }

    if (routeCoords.length >= 2) {
      L.polyline(routeCoords, {
        color: "#94A3B8",
        weight: 3,
        opacity: 0.5,
        dashArray: "8, 12",
      }).addTo(staticLayer)
    } else if (sv && bv) {
      L.polyline(
        [[sellerLat!, sellerLng!], [shippingLat!, shippingLng!]],
        { color: "#94A3B8", weight: 2, opacity: 0.4, dashArray: "4, 8" },
      ).addTo(staticLayer)
    }

    const pts: L.LatLng[] = []
    if (sv) pts.push(L.latLng(sellerLat!, sellerLng!))
    if (bv) pts.push(L.latLng(shippingLat!, shippingLng!))

    if (pts.length >= 2) {
      map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 15 })
    } else if (pts.length === 1) {
      map.setView(pts[0], 12)
    }
  }, [routeCoords, sellerLat, sellerLng, shippingLat, shippingLng, sellerName, shippingName, mapId])

  // ─── 4. Create shipper marker once coords are available ─────────
  useEffect(() => {
    const cache = _mapCache.get(mapId)
    if (!cache) return
    if (shipperRef.current) return // already exists

    const coords = resolveCoords(sellerLat, sellerLng, shippingLat, shippingLng)
    if (!coords) return
    const { sLat, sLng, bLat, bLng } = coords

    const pos = positionForStatus(orderStatus, sLat, sLng, bLat, bLng, routeCoords)

    shipperRef.current = L.marker(pos, {
      icon: createShipperIcon(),
      zIndexOffset: 1000,
    })
      .addTo(cache.shipperLayer)
      .bindPopup(shipperLabel(orderStatus))
  }, [sellerLat, sellerLng, shippingLat, shippingLng, routeCoords, orderStatus, mapId])

  // ─── 5. Helper: update traveled (blue) path ─────────────────────
  function updateTraveledPath(
    progress: number,
    rCoords: [number, number][],
    sLat: number, sLng: number,
    bLat: number, bLng: number,
  ) {
    const cache = _mapCache.get(mapId)
    if (!cache) return

    let traveled: [number, number][]
    const p = Math.min(progress, 1)
    if (rCoords.length >= 2) {
      const idx = Math.floor(rCoords.length * p)
      traveled = rCoords.slice(0, Math.max(idx + 1, 1))
    } else {
      traveled = [[sLat, sLng], [sLat + (bLat - sLat) * p, sLng + (bLng - sLng) * p]]
    }

    if (traveledLineRef.current) {
      traveledLineRef.current.setLatLngs(traveled)
    } else {
      traveledLineRef.current = L.polyline(traveled, {
        color: "#2563EB",
        weight: 4,
        opacity: 0.9,
      }).addTo(cache.shipperLayer)
    }
  }

  // ─── 6. Animate shipper on status change ────────────────────────
  useEffect(() => {
    const marker = shipperRef.current
    if (!marker) return

    const coords = resolveCoords(sellerLat, sellerLng, shippingLat, shippingLng)
    if (!coords) return
    const { sLat, sLng, bLat, bLng } = coords
    const rCoords = routeCoords

    const prevStatus = prevStatusRef.current
    prevStatusRef.current = orderStatus

    const target = positionForStatus(orderStatus, sLat, sLng, bLat, bLng, rCoords)
    marker.setPopupContent(shipperLabel(orderStatus))

    if (prevStatus === orderStatus) {
      marker.setLatLng(target)
      const p = orderStatus === "pending" ? 0 : orderStatus === "shipping" ? 0.4 : 1
      updateTraveledPath(p, rCoords, sLat, sLng, bLat, bLng)
      return
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    const startLL = marker.getLatLng()
    const startTime = performance.now()
    const duration =
      orderStatus === "shipping" ? 1500 :
      prevStatus === "shipping" && orderStatus === "delivered" ? 1000 : 500

    if (startLL.lat === target[0] && startLL.lng === target[1]) return

    function step(now: number) {
      if (!marker) return
      const t = Math.min((now - startTime) / duration, 1)
      const e = easeOutCubic(t)
      marker.setLatLng([startLL.lat + (target[0] - startLL.lat) * e, startLL.lng + (target[1] - startLL.lng) * e])
      const p =
        orderStatus === "shipping" ? 0.4 + 0.55 * e :
        orderStatus === "delivered" ? 0.4 + 0.6 * e : e
      updateTraveledPath(p, rCoords, sLat, sLng, bLat, bLng)
      if (t < 1) animFrameRef.current = requestAnimationFrame(step)
    }

    animFrameRef.current = requestAnimationFrame(step)
  }, [orderStatus, routeCoords, sellerLat, sellerLng, shippingLat, shippingLng, mapId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 7. Continuous tracking during SHIPPING ─────────────────────
  useEffect(() => {
    if (orderStatus !== "shipping") return
    const marker = shipperRef.current
    if (!marker) return

    const coords = resolveCoords(sellerLat, sellerLng, shippingLat, shippingLng)
    if (!coords) return
    const { sLat, sLng, bLat, bLng } = coords
    const rCoords = routeCoords
    const startTime = performance.now()
    const VISUAL_DURATION = 25_000

    const interval = setInterval(() => {
      const t = Math.min((performance.now() - startTime) / VISUAL_DURATION, 1)
      const progress = 0.4 + 0.55 * t
      const pos = routeProgress(progress, rCoords, sLat, sLng, bLat, bLng)
      marker.setLatLng(pos)
      updateTraveledPath(progress, rCoords, sLat, sLng, bLat, bLng)
    }, 2000)

    return () => clearInterval(interval)
  }, [orderStatus, routeCoords, sellerLat, sellerLng, shippingLat, shippingLng, mapId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={wrapperRef}
      className={`relative z-0 w-full rounded-xl border border-[#D8E2EF] overflow-hidden ${className || "h-[450px]"}`}
    />
  )
}

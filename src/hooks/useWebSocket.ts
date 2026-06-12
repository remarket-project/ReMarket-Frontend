import { useCallback, useEffect, useRef } from "react"
import useAuth from "@/hooks/useAuth"

type WSEventHandler = (data: Record<string, unknown>) => void

const WS_BASE =
  import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000/api/v1`

const MAX_RETRIES = 10

export function useWebSocket(handlers: Record<string, WSEventHandler>) {
  const { user } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const attemptRef = useRef(0)
  const mountedRef = useRef(false)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const disconnect = useCallback(() => {
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current)
      reconnectRef.current = undefined
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    const token = localStorage.getItem("access_token")
    if (!token) return

    if (attemptRef.current >= MAX_RETRIES) {
      return
    }

    const url = `${WS_BASE}/ws?token=${token}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      attemptRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const type = data.type as string
        const handler = handlersRef.current[type]
        if (handler) {
          handler(data)
        }
      } catch {
        /* silent */
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      attemptRef.current++
      if (attemptRef.current >= MAX_RETRIES) {
        return
      }
      const delay = Math.min(1000 * 2 ** attemptRef.current, 30000)
      reconnectRef.current = setTimeout(connect, delay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    attemptRef.current = 0

    if (!user) return
    connect()

    return () => {
      mountedRef.current = false
      disconnect()
    }
  }, [user?.id, connect, disconnect])
}

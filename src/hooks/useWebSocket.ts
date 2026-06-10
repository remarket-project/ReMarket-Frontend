import { useCallback, useEffect, useRef } from "react"
import useAuth from "@/hooks/useAuth"

type WSEventHandler = (data: Record<string, unknown>) => void

const WS_BASE =
  import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000/api/v1`

export function useWebSocket(handlers: Record<string, WSEventHandler>) {
  const { user } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const attemptRef = useRef(0)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const connect = useCallback(() => {
    const token = localStorage.getItem("access_token")
    if (!token) return

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
      const delay = Math.min(1000 * 2 ** attemptRef.current, 30000)
      attemptRef.current++
      reconnectRef.current = setTimeout(connect, delay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    if (!user) return
    connect()
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [user, connect])
}

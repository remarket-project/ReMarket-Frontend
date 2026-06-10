import { useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

import { ChatsService } from "@/client"
import useAuth from "@/hooks/useAuth"
import { useWebSocket } from "@/hooks/useWebSocket"

const UNREAD_KEY = "chat_last_seen"

interface ChatValue {
  isOpen: boolean
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  currentConversationId: string | null
  openConversation: (id: string) => void
  closeConversation: () => void
  unreadCount: number
  refreshUnread: () => void
  markConversationRead: (id: string, count: number) => void
}

const ChatContext = createContext<ChatValue | null>(null)

function loadSeen(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(UNREAD_KEY) || "{}")
  } catch {
    return {}
  }
}

function saveSeen(data: Record<string, number>) {
  try {
    localStorage.setItem(UNREAD_KEY, JSON.stringify(data))
  } catch {
    /* noop */
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [lastSeen, setLastSeen] = useState<Record<string, number>>({})
  const [unreadCount, setUnreadCount] = useState(0)
  const seenRef = useRef(lastSeen)
  seenRef.current = lastSeen

  useEffect(() => {
    if (user) {
      setLastSeen(loadSeen())
    } else {
      setLastSeen({})
      setUnreadCount(0)
    }
  }, [user])

  const computeUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    try {
      const conversations =
        await ChatsService.listMyConversationsApiV1ChatsConversationsGet({
          limit: 50,
        })
      const seen = seenRef.current
      let total = 0
      for (const conv of conversations) {
        const prev = seen[conv.id] || 0
        total += Math.max(0, conv.messages_count - prev)
      }
      setUnreadCount(total)
    } catch {
      /* silent */
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    computeUnread()
    const interval = setInterval(computeUnread, 30000)
    return () => clearInterval(interval)
  }, [user, computeUnread])

  useWebSocket({
    chat_message: useCallback(
      (data: Record<string, unknown>) => {
        const conversationId = data.conversation_id as string | undefined
        if (conversationId) {
          queryClient.invalidateQueries({
            queryKey: ["conversation-messages", conversationId],
          })
        }
        queryClient.invalidateQueries({ queryKey: ["conversations"] })
        computeUnread()
      },
      [queryClient, computeUnread],
    ),
  })

  const toggleChat = useCallback(() => {
    setIsOpen((v) => !v)
    if (isOpen) setCurrentId(null)
  }, [isOpen])

  const openChat = useCallback(() => setIsOpen(true), [])
  const closeChat = useCallback(() => {
    setIsOpen(false)
    setCurrentId(null)
  }, [])

  const openConversation = useCallback((id: string) => {
    setCurrentId(id)
    setIsOpen(true)
  }, [])

  const closeConversation = useCallback(() => setCurrentId(null), [])

  const markConversationRead = useCallback((id: string, count: number) => {
    setLastSeen((prev) => {
      const next = { ...prev, [id]: count }
      saveSeen(next)
      seenRef.current = next
      return next
    })
  }, [])

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        toggleChat,
        openChat,
        closeChat,
        currentConversationId: currentId,
        openConversation,
        closeConversation,
        unreadCount,
        refreshUnread: computeUnread,
        markConversationRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}

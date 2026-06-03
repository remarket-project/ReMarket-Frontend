import { useChat } from "@/hooks/ChatContext"
import { ChatWidget } from "./ChatWidget"
import { ChatWidgetToggle } from "./ChatWidgetToggle"

export function ChatGlobal() {
  const { isOpen, toggleChat, unreadCount } = useChat()

  return (
    <>
      <ChatWidget />
      <ChatWidgetToggle
        isOpen={isOpen}
        unreadCount={unreadCount}
        onClick={toggleChat}
      />
    </>
  )
}

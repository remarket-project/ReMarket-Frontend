import { type ChatMessageRead } from "@/client"

interface ChatMessageBubbleProps {
  message: ChatMessageRead
  isOwn: boolean
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

export function ChatMessageBubble({ message, isOwn }: ChatMessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1.5`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? "bg-[#2563EB] text-white rounded-br-md"
            : "bg-white text-[#102A43] border border-[#D8E2EF] rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-line break-words">{message.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isOwn ? "text-blue-200" : "text-[#94A3B8]"
          }`}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}

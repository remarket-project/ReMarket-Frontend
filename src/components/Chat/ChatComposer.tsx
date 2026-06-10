import { Loader2, Send } from "lucide-react"
import { type KeyboardEvent, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatComposerProps {
  onSend: (content: string) => void
  disabled?: boolean
  isPending?: boolean
}

export function ChatComposer({
  onSend,
  disabled,
  isPending,
}: ChatComposerProps) {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isPending) return
    onSend(trimmed)
    setText("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-[#D8E2EF] bg-white p-3">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tin nhắn..."
        disabled={disabled}
        rows={1}
        className="min-h-[40px] max-h-[120px] resize-none rounded-xl border-[#D8E2EF] bg-[#F8FAFC] text-sm placeholder:text-[#94A3B8] focus-visible:ring-[#2563EB]"
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!text.trim() || isPending || disabled}
        className="h-10 w-10 shrink-0 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </div>
  )
}

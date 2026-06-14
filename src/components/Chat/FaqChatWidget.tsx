import { useState } from "react"
import { MessageSquare, Send, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SUGGESTIONS = [
  "Làm thế nào để đăng tin bán hàng?",
  "Tìm iphone giá dưới 15 triệu",
  "Phí giao dịch là bao nhiêu?",
  "Sản phẩm nào đang hot?",
  "Có laptop nào tốt không?",
]

export function FaqChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Chào bạn! Tôi là trợ lý ảo của ReMarket. Bạn cần hỗ trợ gì về sản phẩm, giá cả hay chính sách?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const toHistory = (msgs: typeof messages) =>
    msgs.slice(1).map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.content,
    }))

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: msg }])
    setLoading(true)

    try {
      const res = await fetch("/api/v1/faq/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: msg,
          history: toHistory(messages),
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "bot", content: data.answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại!" },
      ])
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 size-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 flex items-center justify-center z-50 transition-transform hover:scale-110"
      >
        <MessageSquare className="size-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[560px] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden z-50">
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5" />
          <span className="font-bold">Trợ lý ReMarket</span>
        </div>
        <button onClick={() => setOpen(false)} className="hover:bg-blue-500 rounded-full p-1 transition-colors">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl px-4 py-2 text-sm text-slate-500">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce [animation-delay:0.1s]">.</span>
                <span className="animate-bounce [animation-delay:0.2s]">.</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-400 mb-2">Gợi ý nhanh:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          placeholder="Nhập câu hỏi..."
          className="flex-1 h-10 text-sm"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="size-10"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}

import { useNavigate } from "@tanstack/react-router"
import { Package, Send, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FaqProduct {
  id: string
  title: string
  price: number
  condition: string
  location: string
  seller: string
  image_url?: string | null
}

interface FaqSuggestedAction {
  label: string
  payload: string
}

interface ChatMessage {
  role: "user" | "bot"
  content: string
  products?: FaqProduct[]
  suggested_actions?: FaqSuggestedAction[]
}

const SUGGESTIONS = [
  "Làm thế nào để đăng tin bán hàng?",
  "Tìm iphone giá dưới 15 triệu",
  "Phí giao dịch là bao nhiêu?",
  "Sản phẩm nào đang hot?",
  "Có laptop nào tốt không?",
]

const CONDITION_LABELS: Record<string, string> = {
  brand_new: "Mới nguyên",
  like_new: "Như mới",
  good: "Tốt",
  fair: "Khá",
  poor: "Kém",
  new: "Mới",
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[\s]*\*\s+/gm, "• ")
}

function formatVND(value: number) {
  if (!value || Number.isNaN(value) || value <= 0) return "0 ₫"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function ProductCard({ product }: { product: FaqProduct }) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const handleClick = () =>
    navigate({ to: "/items/$listingId", params: { listingId: product.id } })

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col cursor-pointer gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md active:scale-[0.97] text-left w-full"
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="size-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-slate-300">
            <Package className="size-8" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-tight text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </p>
        <p className="mt-0.5 text-xs font-bold text-blue-600">
          {formatVND(product.price)}
        </p>
        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 uppercase">
          {CONDITION_LABELS[product.condition] || product.condition}
        </span>
      </div>
    </button>
  )
}

export function FaqChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content:
        "Chào bạn! Tôi là trợ lý ảo của ReMarket. Bạn cần hỗ trợ gì về sản phẩm, giá cả hay chính sách?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toHistory = (msgs: ChatMessage[]) =>
    msgs.slice(1).map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.content,
    }))

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput("")
    const userMsg: ChatMessage = { role: "user", content: msg }
    setMessages((prev) => [...prev, userMsg])
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
      const botMsg: ChatMessage = {
        role: "bot",
        content: data.answer,
        products: data.products || [],
        suggested_actions: data.suggested_actions || [],
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại!",
          products: [],
          suggested_actions: [],
        },
      ])
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 cursor-pointer transition-transform hover:scale-110"
      >
        <img
          src="/assets/images/chat-bot1.png"
          alt="Trợ lý AI"
          className="size-15"
        />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden z-50">
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <img src="/assets/images/robot1.png" alt="AI" className="size-10" />
          <span className="font-bold">Trợ lý ReMarket</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="hover:bg-blue-500 rounded-full p-1 transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i}>
            <div
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-slate-100 text-slate-800 rounded-bl-md"
                }`}
              >
                {msg.role === "bot" ? stripMarkdown(msg.content) : msg.content}
              </div>
            </div>

            {msg.role === "bot" && msg.products && msg.products.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-thin">
                {msg.products.map((product) => (
                  <div key={product.id} className="snap-start shrink-0 w-52">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {msg.role === "bot" &&
              msg.suggested_actions &&
              msg.suggested_actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.suggested_actions.map((action, ai) => (
                    <button
                      type="button"
                      key={ai}
                      onClick={() => sendMessage(action.payload)}
                      className="text-xs bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-slate-200 rounded-full px-3 py-1.5 text-slate-600 transition-colors shadow-sm"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-500 rounded-bl-md">
              <span className="inline-flex gap-1">
                <span className="size-2 bg-slate-400 rounded-full animate-bounce" />
                <span className="size-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="size-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2 shrink-0">
          <p className="text-xs text-slate-400 mb-2">Gợi ý nhanh:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                type="button"
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

      <div className="border-t p-3 flex gap-2 shrink-0">
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

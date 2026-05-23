import { createFileRoute, Link } from "@tanstack/react-router"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/_layout/help/faq")({
  component: FAQPage,
  head: () => ({
    meta: [{ title: "Câu hỏi thường gặp - ReMarket" }],
  }),
})

const faqs = [
  {
    q: "Làm thế nào để đăng tin bán hàng?",
    a: "Đăng nhập tài khoản, nhấn nút 'Đăng tin' ở góc phải header, điền đầy đủ thông tin theo 5 bước và nhấn 'Đăng tin'. Tin của bạn sẽ được kiểm duyệt trước khi hiển thị.",
  },
  {
    q: "Thanh toán qua escrow hoạt động thế nào?",
    a: "Khi người mua và người bán đồng ý giao dịch, số tiền sẽ được giữ trong tài khoản trung gian (escrow). Chỉ khi người mua xác nhận đã nhận hàng, tiền mới được giải ngân cho người bán.",
  },
  {
    q: "Mất bao lâu để nhận được tiền sau khi bán?",
    a: "Sau khi người mua xác nhận đã nhận hàng, tiền sẽ được giải ngân ngay lập tức vào ví ReMarket của bạn. Bạn có thể rút về tài khoản ngân hàng bất kỳ lúc nào.",
  },
  {
    q: "Làm sao để liên hệ với người bán?",
    a: "Bạn có thể nhắn tin trực tiếp qua tính năng Chat trên trang chi tiết tin đăng hoặc từ trang thương lượng (Offers).",
  },
  {
    q: "Tôi có thể hủy đơn hàng không?",
    a: "Có, bạn có thể hủy đơn hàng trước khi người bán xác nhận đã gửi hàng. Sau đó, bạn cần mở dispute để đội ngũ hỗ trợ can thiệp.",
  },
  {
    q: "Phí giao dịch trên ReMarket là bao nhiêu?",
    a: "ReMarket thu phí dịch vụ 3% trên mỗi giao dịch thành công. Phí này được khấu trừ tự động khi giải ngân cho người bán.",
  },
  {
    q: "Làm sao để thay đổi mật khẩu?",
    a: "Vào trang Cài đặt tài khoản, chọn tab 'Mật khẩu', nhập mật khẩu cũ và mật khẩu mới, sau đó nhấn 'Lưu thay đổi'.",
  },
]

function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <Link
        to="/help"
        className="mb-4 inline-flex items-center text-sm text-[#2563EB] hover:underline"
      >
        ← Trung tâm trợ giúp
      </Link>
      <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
        Câu hỏi thường gặp
      </h1>
      <p className="mt-1 text-[#5B7083]">
        Các câu hỏi phổ biến về giao dịch trên ReMarket.
      </p>

      <div className="mt-6 space-y-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx
          return (
            <div
              key={idx}
              className="rounded-xl border border-[#D8E2EF] bg-white overflow-hidden"
            >
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#102A43] hover:bg-[#F5F8FC]"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                {faq.q}
                {isOpen ? (
                  <ChevronUp className="size-4 shrink-0 text-[#5B7083]" />
                ) : (
                  <ChevronDown className="size-4 shrink-0 text-[#5B7083]" />
                )}
              </button>
              {isOpen && (
                <div className="border-t border-[#D8E2EF] px-4 py-3 text-sm text-[#5B7083]">
                  {faq.a}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {faqs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#D8E2EF] bg-white p-6 text-sm text-[#5B7083]">
          Không có câu hỏi nào.
        </div>
      ) : null}
    </div>
  )
}

import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/legal/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [{ title: "Chính sách bảo mật - ReMarket" }],
  }),
})

function PrivacyPage() {
  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
          Chính sách bảo mật
        </h1>
        <p className="mt-1 text-sm text-[#5B7083]">
          Cập nhật lần cuối: Tháng 05/2026
        </p>

        <hr className="my-6 border-[#D8E2EF]" />

        <div className="space-y-6 text-[#5B7083]">
          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              1. Thông tin chúng tôi thu thập
            </h2>
            <p className="mt-2">
              Chúng tôi thu thập thông tin cá nhân bạn cung cấp khi đăng ký tài
              khoản, bao gồm: họ tên, email, số điện thoại, địa chỉ. Chúng tôi
              cũng thu thập dữ liệu sử dụng nền tảng để cải thiện trải nghiệm.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              2. Cách chúng tôi sử dụng thông tin
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Xác thực tài khoản và hỗ trợ người dùng.</li>
              <li>Xử lý giao dịch và thanh toán.</li>
              <li>Gửi thông báo liên quan đến giao dịch.</li>
              <li>Cải thiện và phát triển nền tảng.</li>
              <li>Phát hiện và ngăn chặn hành vi gian lận.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              3. Chia sẻ thông tin
            </h2>
            <p className="mt-2">
              ReMarket không bán thông tin cá nhân của bạn cho bên thứ ba. Thông
              tin chỉ được chia sẻ khi cần thiết để xử lý giao dịch, tuân thủ
              pháp luật, hoặc bảo vệ quyền lợi của nền tảng.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              4. Bảo mật dữ liệu
            </h2>
            <p className="mt-2">
              Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù
              hợp để bảo vệ dữ liệu của bạn khỏi truy cập trái phép, mất mát
              hoặc hư hỏng.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              5. Quyền của bạn
            </h2>
            <p className="mt-2">
              Bạn có quyền truy cập, chỉnh sửa và xóa thông tin cá nhân của mình
              bất kỳ lúc nào qua trang Cài đặt tài khoản. Bạn cũng có thể yêu
              cầu chúng tôi xuất dữ liệu của bạn.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

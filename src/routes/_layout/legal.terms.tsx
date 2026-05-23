import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/legal/terms")({
  component: TermsPage,
  head: () => ({
    meta: [{ title: "Điều khoản sử dụng - ReMarket" }],
  }),
})

function TermsPage() {
  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
          Điều khoản sử dụng
        </h1>
        <p className="mt-1 text-sm text-[#5B7083]">
          Cập nhật lần cuối: Tháng 05/2026
        </p>

        <hr className="my-6 border-[#D8E2EF]" />

        <div className="space-y-6 text-[#5B7083]">
          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              1. Giới thiệu
            </h2>
            <p className="mt-2">
              Chào mừng bạn đến với ReMarket. Bằng việc truy cập và sử dụng nền
              tảng, bạn đồng ý tuân thủ các điều khoản sử dụng này.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              2. Tài khoản người dùng
            </h2>
            <p className="mt-2">
              Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình. Không
              được chia sẻ mật khẩu hoặc cho phép người khác sử dụng tài khoản
              của bạn. ReMarket có quyền khóa tài khoản nếu phát hiện hành vi vi
              phạm.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              3. Giao dịch
            </h2>
            <p className="mt-2">
              Tất cả giao dịch trên ReMarket được khuyến khích thực hiện qua hệ
              thống escrow. Người bán cam kết cung cấp thông tin sản phẩm chính
              xác. Người mua cam kết thanh toán đầy đủ và đúng hạn.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              4. Nội dung bị cấm
            </h2>
            <p className="mt-2">
              Không được đăng tải nội dung vi phạm pháp luật, hàng giả, hàng
              nhái, nội dung khiêu dâm, vũ khí, chất cấm, hoặc bất kỳ mặt hàng
              nào bị pháp luật Việt Nam cấm kinh doanh.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              5. Phí dịch vụ
            </h2>
            <p className="mt-2">
              ReMarket thu phí dịch vụ 3% trên mỗi giao dịch thành công. Mức phí
              có thể thay đổi theo từng thời kỳ và sẽ được thông báo trước trên
              nền tảng.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              6. Giải quyết tranh chấp
            </h2>
            <p className="mt-2">
              Khi có tranh chấp, hai bên có thể yêu cầu ReMarket làm trung gian
              hòa giải. Quyết định của ReMarket dựa trên bằng chứng được cung
              cấp và có tính chất quyết định trên nền tảng.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

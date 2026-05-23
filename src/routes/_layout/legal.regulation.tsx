import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/legal/regulation")({
  component: RegulationPage,
  head: () => ({
    meta: [{ title: "Quy chế hoạt động - ReMarket" }],
  }),
})

function RegulationPage() {
  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
          Quy chế hoạt động sàn
        </h1>
        <p className="mt-1 text-sm text-[#5B7083]">
          Cập nhật lần cuối: Tháng 05/2026
        </p>

        <hr className="my-6 border-[#D8E2EF]" />

        <div className="space-y-6 text-[#5B7083]">
          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              1. Nguyên tắc chung
            </h2>
            <p className="mt-2">
              ReMarket là sàn thương mại điện tử trung gian kết nối người mua và
              người bán. ReMarket không phải là chủ sở hữu của hàng hóa được
              niêm yết trên nền tảng.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              2. Điều kiện tham gia
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Người dùng phải đủ 18 tuổi hoặc có sự đồng ý của người giám hộ.
              </li>
              <li>Tài khoản phải được đăng ký bằng thông tin chính xác.</li>
              <li>
                Mỗi cá nhân chỉ được sở hữu một tài khoản trên ReMarket.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              3. Quy trình giao dịch
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Người bán đăng tin.</li>
              <li>Người mua gửi đề nghị mua hoặc thương lượng giá.</li>
              <li>Hai bên thống nhất, đơn hàng được tạo.</li>
              <li>Người mua thanh toán qua escrow.</li>
              <li>Người bán gửi hàng hoặc hẹn gặp trực tiếp.</li>
              <li>Người mua xác nhận đã nhận hàng.</li>
              <li>Tiền được giải ngân cho người bán.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              4. Chính sách kiểm duyệt
            </h2>
            <p className="mt-2">
              Tất cả tin đăng và tài khoản mới đều phải trải qua quy trình kiểm
              duyệt. ReMarket có quyền từ chối hoặc gỡ bỏ bất kỳ nội dung nào vi
              phạm quy định.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              5. Xử lý vi phạm
            </h2>
            <p className="mt-2">
              Tùy theo mức độ vi phạm, ReMarket có thể áp dụng các biện pháp: cảnh
              cáo, khóa tạm thời, khóa vĩnh viễn tài khoản, và/hoặc chuyển cho cơ
              quan chức năng nếu có dấu hiệu vi phạm pháp luật hình sự.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

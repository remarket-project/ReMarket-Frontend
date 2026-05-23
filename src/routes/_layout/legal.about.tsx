import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/legal/about")({
  component: AboutPage,
  head: () => ({
    meta: [{ title: "Giới thiệu - ReMarket" }],
  }),
})

function AboutPage() {
  return (
    <div className="rounded-3xl border border-[#D8E2EF] bg-white p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
          Giới thiệu về ReMarket
        </h1>
        <p className="mt-1 text-[#5B7083]">
          Nền tảng mua bán đồ cũ với giao dịch minh bạch, thanh toán an toàn.
        </p>

        <hr className="my-6 border-[#D8E2EF]" />

        <div className="space-y-6 text-[#5B7083]">
          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              Sứ mệnh
            </h2>
            <p className="mt-2">
              ReMarket ra đời với sứ mệnh tạo ra một thị trường đồ cũ minh bạch,
              nơi người mua và người bán có thể giao dịch an tâm nhờ hệ thống
              escrow tích hợp và cộng đồng tin cậy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              Giá trị cốt lõi
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Minh bạch:</strong> Mọi giao dịch đều được ghi nhận và
                giám sát.
              </li>
              <li>
                <strong>An toàn:</strong> Thanh toán qua escrow - chỉ giải ngân
                khi người mua xác nhận hài lòng.
              </li>
              <li>
                <strong>Tin cậy:</strong> Hệ thống điểm tin cậy và đánh giá giúp
                xây dựng lòng tin giữa các thành viên.
              </li>
              <li>
                <strong>Bền vững:</strong> Khuyến khích tái sử dụng, giảm rác
                thải điện tử và đồ dùng.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#102A43]">
              Liên hệ
            </h2>
            <p className="mt-2">
              ReMarket được phát triển bởi đội ngũ kỹ sư và nhà thiết kế đam mê
              tạo ra một nền tảng mua bán an toàn hơn. Mọi thắc mắc xin vui lòng
              liên hệ qua email{" "}
              <a
                href="mailto:support@remarket.vn"
                className="text-[#2563EB] hover:underline"
              >
                support@remarket.vn
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

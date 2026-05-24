import { Link } from "@tanstack/react-router"
import { ArrowLeft, BadgeCheck, Handshake, ShieldCheck } from "lucide-react"
import { LanguageSwitcher } from "@/components/Common/LanguageSwitcher"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative isolate grid h-svh w-screen overflow-hidden lg:grid-cols-12 bg-slate-50">
      {/* Hero Panel (Left Column - 5 cols on desktop) */}
      <div className="relative hidden flex-col justify-between p-10 lg:flex lg:col-span-5 bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] text-white overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/40 blur-[100px] pointer-events-none" />

        {/* Top Section: Back Link & Brand */}
        <div className="relative z-10 space-y-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-all font-medium group"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Quay lại Trang chủ</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-11 rounded-xl bg-white p-2 shadow-lg">
              <img
                src="/assets/images/logo_Remarket_2.png"
                alt="ReMarket Logo"
                className="size-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                ReMarket
              </h2>
              <p className="text-[10px] text-blue-200 font-bold tracking-widest uppercase mt-0.5">
                Nền tảng giao dịch an toàn
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section: Slogan & Intro */}
        <div className="relative z-10 my-auto py-10 space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            Mua bán an toàn,
            <br />
            minh bạch cùng ReMarket
          </h1>
          <p className="text-sm text-blue-100/90 max-w-md leading-relaxed">
            ReMarket giúp bạn trao đổi, mua bán đồ cũ chất lượng với tính năng
            thanh toán đảm bảo và người dùng được xác thực.
          </p>
        </div>

        {/* Bottom Section: Trust Badges */}
        <div className="relative z-10 space-y-4">
          {/* Trust Badge 1 */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/10">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">
                Escrow bảo vệ người dùng
              </h4>
              <p className="text-xs text-blue-100/80 mt-0.5 leading-relaxed">
                Tiền của bạn chỉ được chuyển cho người bán khi bạn xác nhận đã
                nhận hàng đúng mô tả.
              </p>
            </div>
          </div>

          {/* Trust Badge 2 */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/10">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <Handshake className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">
                Giao dịch an toàn & minh bạch
              </h4>
              <p className="text-xs text-blue-100/80 mt-0.5 leading-relaxed">
                Thương lượng giá trực tiếp, tạo đơn hàng nhanh chóng và theo dõi
                trạng thái vận chuyển thời gian thực.
              </p>
            </div>
          </div>

          {/* Trust Badge 3 */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/10">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <BadgeCheck className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">
                Người bán được xác minh
              </h4>
              <p className="text-xs text-blue-100/80 mt-0.5 leading-relaxed">
                Hệ thống KYC (xác thực danh tính) và đánh giá uy tín giúp hạn
                chế tối đa rủi ro gian lận.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel (Right Column - 7 cols on desktop) */}
      <div className="relative flex flex-col min-h-svh lg:col-span-7 bg-slate-50 overflow-y-auto">
        {/* Top Header inside Form Panel */}
        <div className="flex items-center justify-between p-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium lg:hidden"
          >
            <ArrowLeft className="size-4" />
            <span>Trang chủ</span>
          </Link>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-[440px] bg-white border border-slate-200/80 shadow-xl shadow-slate-100/50 rounded-2xl p-6 sm:p-8 md:p-10 transition-all duration-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

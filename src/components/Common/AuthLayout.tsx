import { Link } from "@tanstack/react-router"
import { ArrowLeft, BadgeCheck, Handshake, ShieldCheck } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative isolate grid h-svh w-screen overflow-hidden lg:grid-cols-10 bg-slate-50">
      {/* Hero Panel (Left Column - 6 cols on desktop) */}
      <div
        className="relative hidden flex-col justify-between p-10 lg:flex lg:col-span-6 text-white overflow-hidden"
        style={{
          backgroundImage: 'url("/assets/images/banner1.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay mờ dần từ trái sang phải - hết phần 4 là trong suốt */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/70 via-blue-950/15 via-[30%] to-transparent to-[40%] pointer-events-none" />

        {/* Animated Glow Orbs */}
        <div className="absolute top-[-8%] left-[-8%] w-[50%] h-[50%] rounded-full bg-cyan-400/15 blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-violet-500/20 blur-[130px] animate-pulse [animation-delay:2s] pointer-events-none" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse [animation-delay:4s] pointer-events-none" />

        {/* Decorative Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top Section: Back Link & Brand */}
        <div className="relative z-10 space-y-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-all duration-300 font-medium group"
          >
            <ArrowLeft className="size-4 transition-all duration-300 group-hover:-translate-x-1" />
            <span>Quay lại Trang chủ</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-14 rounded-xl bg-white/95 p-2.5 shadow-lg shadow-black/10 ring-1 ring-white/20">
              <img
                src="/assets/images/logo_Remarket_2.png"
                alt="ReMarket Logo"
                className="size-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                ReMarket
              </h2>
              <p className="text-xs text-blue-300 font-bold tracking-[0.15em] uppercase mt-0.5">
                Nền tảng giao dịch an toàn
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section: Slogan & Intro */}
        <div className="relative z-10 my-auto py-10 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 backdrop-blur-md text-xs font-medium text-white/80 tracking-wide">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
            Niềm tin & Minh bạch
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              Mua bán an toàn,
              <br />
              minh bạch cùng ReMarket
            </span>
          </h1>
          <p className="text-sm text-white/70 max-w-md leading-relaxed">
            ReMarket giúp bạn trao đổi, mua bán đồ cũ chất lượng với tính năng
            thanh toán đảm bảo và người dùng được xác thực.
          </p>
        </div>

        {/* Bottom Section: Trust Badges */}
        <div className="relative z-10 flex flex-col items-start space-y-2.5">
          {/* Trust Badge 1 */}
          <div className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-white/15 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10 w-full max-w-[600px]">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/30 to-emerald-500/10 text-emerald-300 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:from-emerald-400/40">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm whitespace-nowrap">
                Escrow bảo vệ người dùng
              </h4>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                Tiền của bạn chỉ được chuyển cho người bán khi bạn xác nhận đã
                nhận hàng đúng mô tả.
              </p>
            </div>
          </div>

          {/* Trust Badge 2 */}
          <div className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-white/15 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10 w-full max-w-[600px]">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-cyan-500/10 text-cyan-300 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:from-cyan-400/40">
              <Handshake className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm whitespace-nowrap">
                Giao dịch an toàn & minh bạch
              </h4>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                Thương lượng giá trực tiếp, tạo đơn hàng nhanh chóng và theo dõi
                trạng thái vận chuyển thời gian thực.
              </p>
            </div>
          </div>

          {/* Trust Badge 3 */}
          <div className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xl transition-all duration-300 hover:bg-white/15 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10 w-full max-w-[600px]">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400/30 to-violet-500/10 text-violet-300 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:from-violet-400/40">
              <BadgeCheck className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm whitespace-nowrap">
                Người bán được xác minh
              </h4>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                Hệ thống KYC (xác thực danh tính) và đánh giá uy tín giúp hạn
                chế tối đa rủi ro gian lận.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel (Right Column - 4 cols on desktop) */}
      <div className="relative flex flex-col h-svh lg:col-span-4 bg-slate-50">
        {/* Top Header inside Form Panel */}
        <div className="flex items-center px-4 sm:px-6 pt-2 pb-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium lg:hidden"
          >
            <ArrowLeft className="size-4" />
            <span>Trang chủ</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-3 sm:px-6 overflow-y-auto">
          <div className="w-full max-w-[440px] bg-white border border-slate-200/80 shadow-xl shadow-slate-100/50 rounded-2xl p-5 sm:p-6 md:p-8 transition-all duration-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

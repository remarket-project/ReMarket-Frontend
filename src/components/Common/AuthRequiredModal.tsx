import { Link } from "@tanstack/react-router"
import { LogIn, Shield, UserPlus, X } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AuthRequiredModalProps {
  open: boolean
  onClose: () => void
  /** Mô tả hành động cần auth, ví dụ: "để mua hàng", "để đăng tin" */
  actionLabel?: string
  /** URL để redirect sau khi đăng nhập thành công */
  redirectAfter?: string
}

export function AuthRequiredModal({
  open,
  onClose,
  actionLabel = "để sử dụng tính năng này",
  redirectAfter,
}: AuthRequiredModalProps) {
  // Đóng modal khi bấm Escape
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [open, onClose])

  // Khóa scroll khi modal mở
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const loginSearch = redirectAfter
    ? `?redirect=${encodeURIComponent(redirectAfter)}`
    : ""
  const loginHref = `/login${loginSearch}`
  const signupHref = "/signup"

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Yêu cầu đăng nhập"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl",
          "animate-in fade-in slide-in-from-bottom-4 duration-300",
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#5B7083]"
          aria-label="Đóng"
        >
          <X className="size-4" />
        </button>

        {/* Header gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#EEF2FF] px-8 pb-8 pt-10">
          <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-blue-200/40 blur-2xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 size-32 rounded-full bg-indigo-200/30 blur-2xl" />

          <div className="relative flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#2563EB] shadow-lg shadow-blue-300/50">
              <Shield className="size-8 text-white" />
            </div>

            <h2 className="text-xl font-bold text-[#102A43]">
              Đăng nhập để tiếp tục
            </h2>
            <p className="mt-2 text-sm text-[#5B7083]">
              Vui lòng đăng nhập hoặc tạo tài khoản{" "}
              <span className="font-medium text-[#2563EB]">{actionLabel}</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 px-8 py-6">
          {/* Login button */}
          <Button
            className="h-12 w-full gap-2 rounded-2xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-semibold shadow-md shadow-blue-200/60 transition-all hover:shadow-lg hover:shadow-blue-200/70"
            asChild
          >
            <Link to={loginHref as "/login"}>
              <LogIn className="size-4" />
              Đăng nhập ngay
            </Link>
          </Button>

          {/* Separator */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8]">hoặc</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          {/* Register button */}
          <Button
            variant="outline"
            className="h-12 w-full gap-2 rounded-2xl border-[#D8E2EF] font-semibold text-[#102A43] hover:bg-[#F8FAFC] hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-all"
            asChild
          >
            <Link to={signupHref as "/signup"}>
              <UserPlus className="size-4" />
              Tạo tài khoản miễn phí
            </Link>
          </Button>

          {/* Continue browsing */}
          <button
            type="button"
            onClick={onClose}
            className="mt-1 w-full py-2 text-sm text-[#94A3B8] transition hover:text-[#5B7083] underline-offset-2 hover:underline"
          >
            Tiếp tục duyệt không đăng nhập
          </button>
        </div>

        {/* Footer note */}
        <div className="border-t border-[#F1F5F9] px-8 py-4 text-center">
          <p className="text-xs text-[#94A3B8]">
            ReMarket bảo vệ thông tin của bạn theo{" "}
            <Link
              to="/legal/privacy"
              className="text-[#2563EB] hover:underline"
              onClick={onClose}
            >
              chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

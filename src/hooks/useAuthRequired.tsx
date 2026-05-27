import { useState } from "react"
import { AuthRequiredModal } from "@/components/Common/AuthRequiredModal"
import { isLoggedIn } from "./useAuth"

/**
 * Hook để guard các actions cần xác thực.
 * Nếu user chưa đăng nhập, hiện modal yêu cầu đăng nhập thay vì thực hiện action.
 *
 * @example
 * const { requireAuth, AuthModal } = useAuthRequired()
 *
 * const handleBuyNow = requireAuth(
 *   () => buyNowMutation.mutate(),
 *   "để mua hàng"
 * )
 *
 * // Trong JSX:
 * <button onClick={handleBuyNow}>Mua ngay</button>
 * <AuthModal />
 */
export function useAuthRequired() {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("để sử dụng tính năng này")

  /**
   * Wrap một function: nếu chưa login thì hiện modal, còn không thì chạy function.
   * @param fn - Function gốc cần guard
   * @param actionLabel - Mô tả hành động (hiển thị trong modal), ví dụ: "để mua hàng"
   */
  function requireAuth<T extends (...args: any[]) => any>(
    fn: T,
    actionLabel?: string,
  ): (...args: Parameters<T>) => ReturnType<T> | void {
    return (...args: Parameters<T>) => {
      if (!isLoggedIn()) {
        setLabel(actionLabel ?? "để sử dụng tính năng này")
        setOpen(true)
        return
      }
      return fn(...args)
    }
  }

  /**
   * Component modal — render trong JSX của component dùng hook này.
   * @example
   * return (
   *   <>
   *     <MyContent />
   *     <AuthModal />
   *   </>
   * )
   */
  function AuthModal() {
    return (
      <AuthRequiredModal
        open={open}
        onClose={() => setOpen(false)}
        actionLabel={label}
        redirectAfter={typeof window !== "undefined" ? window.location.pathname : undefined}
      />
    )
  }

  return { requireAuth, AuthModal, openAuthModal: () => setOpen(true), setOpen }
}

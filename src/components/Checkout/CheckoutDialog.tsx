import { useMutation } from "@tanstack/react-query"
import { Loader2, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import type { PaymentMethod, ShippingAddressInput } from "@/client"
import { OrdersService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import useAuth from "@/hooks/useAuth"
import { formatVND } from "@/lib/order-utils"
import { extractErrorMessage } from "@/utils"
import PaymentMethodSelector from "./PaymentMethodSelector"
import ShippingAddressForm from "./ShippingAddressForm"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId: string
  price: string | number
  listingTitle: string
  onSuccess?: (orderId: string) => void
}

const defaultAddress: ShippingAddressInput = {
  name: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  address_detail: "",
  note: "",
}

export default function CheckoutDialog({
  open,
  onOpenChange,
  listingId,
  price,
  onSuccess,
}: CheckoutDialogProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<"address" | "payment">("address")
  const [address, setAddress] = useState<ShippingAddressInput>(defaultAddress)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet")

  // Prefill address from user profile
  useEffect(() => {
    if (user && open) {
      setAddress((prev) => ({
        name: prev.name || user.full_name || "",
        phone: prev.phone || user.phone || "",
        province: prev.province || user.province || "",
        district: prev.district || user.district || "",
        ward: prev.ward || user.ward || "",
        address_detail: prev.address_detail || user.address_detail || "",
        note: prev.note || "",
      }))
    }
  }, [user, open])

  const buyMutation = useMutation({
    mutationFn: () =>
      OrdersService.createDirectOrderApiV1OrdersPost({
        requestBody: {
          listing_id: listingId,
          payment_method: paymentMethod,
          shipping_address:
            paymentMethod === "cod" || Object.values(address).some((v) => v)
              ? address
              : null,
        },
      }),
    onSuccess: (order) => {
      toast.success("Đặt hàng thành công!")
      onOpenChange(false)
      setStep("address")
      setAddress(defaultAddress)
      if (onSuccess) onSuccess(order.id)
    },
    onError: (err: unknown) => {
      toast.error(
        extractErrorMessage(err as any, "Đặt hàng thất bại. Vui lòng thử lại."),
      )
    },
  })

  const handleConfirm = () => {
    if (step === "address") {
      // Validate all required shipping address fields
      if (
        !address.name?.trim() ||
        !address.phone?.trim() ||
        !address.province ||
        !address.district ||
        !address.ward ||
        !address.address_detail?.trim()
      ) {
        toast.error("Vui lòng điền đầy đủ thông tin giao hàng")
        return
      }
      setStep("payment")
      return
    }
    buyMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl">
        <DialogHeader className="bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-850">
          <DialogTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
            {step === "address"
              ? "📍 Thông tin giao hàng"
              : "🛍️ Xác nhận đặt hàng"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {step === "address"
              ? "Vui lòng nhập địa chỉ nhận hàng để tiếp tục thanh toán"
              : "Kiểm tra lại thông tin và chọn phương thức thanh toán phù hợp"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {step === "address" ? (
            <ShippingAddressForm value={address} onChange={setAddress} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Column: Address review & Payment Method */}
              <div className="md:col-span-7 space-y-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3 text-xs dark:border-gray-800 dark:bg-gray-900/40">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 flex items-center gap-1.5 text-xs">
                    📍 Địa chỉ nhận hàng
                  </h4>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <p className="font-semibold text-gray-900 dark:text-gray-200">
                      {address.name} —{" "}
                      <span className="text-blue-600 dark:text-blue-400">
                        {address.phone}
                      </span>
                    </p>
                    <p className="leading-relaxed">
                      {address.address_detail}, {address.ward},{" "}
                      {address.district}, {address.province}
                    </p>
                    {address.note && (
                      <p className="mt-1 text-gray-500 dark:text-gray-500 italic bg-white dark:bg-gray-950 px-2 py-1 rounded border border-gray-100 dark:border-gray-800">
                        Ghi chú: {address.note}
                      </p>
                    )}
                  </div>
                </div>

                <PaymentMethodSelector
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </div>

              {/* Right Column: Order Summary & Details */}
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50/20 p-4 text-xs dark:border-blue-900/20 dark:bg-blue-950/20">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 uppercase tracking-wider text-[10px]">
                    Tóm tắt đơn hàng
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Sản phẩm</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatVND(price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Phí giao hàng</span>
                      <span className="text-gray-500 dark:text-gray-500 font-medium">
                        Miễn phí
                      </span>
                    </div>
                    <Separator className="my-2 bg-blue-100 dark:bg-blue-900/40" />
                    <div className="flex justify-between text-xs font-bold text-gray-900 dark:text-gray-100">
                      <span>Tổng cộng</span>
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-extrabold">
                        {formatVND(price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-850 gap-2 sm:justify-end">
          <Button
            variant="outline"
            className="h-9 cursor-pointer"
            onClick={() => {
              if (step === "payment") {
                setStep("address")
              } else {
                onOpenChange(false)
              }
            }}
          >
            {step === "payment" ? "Quay lại" : "Hủy"}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={buyMutation.isPending}
            className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium cursor-pointer"
          >
            {buyMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {buyMutation.isPending
              ? "Đang xử lý..."
              : step === "address"
                ? "Tiếp tục"
                : paymentMethod === "wallet"
                  ? "Xác nhận đặt hàng"
                  : "Đặt hàng COD"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

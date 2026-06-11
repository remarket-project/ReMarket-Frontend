import { Loader2, MapPin, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import type { PaymentMethod, ShippingAddressInput } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import useAuth from "@/hooks/useAuth"
import { formatVND } from "@/lib/order-utils"
import ShippingAddressForm from "@/components/Checkout/ShippingAddressForm"
import PaymentMethodSelector from "@/components/Checkout/PaymentMethodSelector"

interface ConfirmOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offerPrice: number
  onSubmit: (address: ShippingAddressInput, paymentMethod: PaymentMethod) => void
  isPending?: boolean
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

export default function ConfirmOrderDialog({
  open,
  onOpenChange,
  offerPrice,
  onSubmit,
  isPending = false,
}: ConfirmOrderDialogProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<"address" | "payment">("address")
  const [address, setAddress] = useState<ShippingAddressInput>(defaultAddress)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet")

  // Reset & prefill when dialog opens
  useEffect(() => {
    if (open) {
      setStep("address")
      setAddress({
        name: user?.full_name || "",
        phone: user?.phone || "",
        province: user?.province || "",
        district: user?.district || "",
        ward: user?.ward || "",
        address_detail: user?.address_detail || "",
        note: "",
      })
      setPaymentMethod("wallet")
    }
  }, [open, user])

  const handleContinue = () => {
    if (
      !address.name?.trim() ||
      !address.phone?.trim() ||
      !address.province ||
      !address.district ||
      !address.ward ||
      !address.address_detail?.trim()
    ) {
      return
    }
    setStep("payment")
  }

  const handleConfirm = () => {
    onSubmit(address, paymentMethod)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-2xl">
        <DialogHeader className="bg-slate-50/50 px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-base font-bold text-gray-900">
            {step === "address"
              ? "📍 Thông tin giao hàng"
              : "🛍️ Xác nhận đặt hàng"}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 mt-0.5">
            {step === "address"
              ? "Vui lòng nhập địa chỉ nhận hàng để tiếp tục"
              : "Kiểm tra lại thông tin và chọn phương thức thanh toán"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {step === "address" ? (
            <ShippingAddressForm value={address} onChange={setAddress} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              <div className="md:col-span-7 space-y-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3 text-xs">
                  <h4 className="font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5 text-xs">
                    <MapPin className="size-3.5" /> Địa chỉ nhận hàng
                  </h4>
                  <div className="space-y-1 text-gray-600">
                    <p className="font-semibold text-gray-900">
                      {address.name} —{" "}
                      <span className="text-blue-600">{address.phone}</span>
                    </p>
                    <p className="leading-relaxed">
                      {address.address_detail}, {address.ward},{" "}
                      {address.district}, {address.province}
                    </p>
                    {address.note && (
                      <p className="mt-1 text-gray-500 italic bg-white px-2 py-1 rounded border border-gray-100">
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

              <div className="md:col-span-5 space-y-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 text-xs">
                  <h4 className="font-semibold text-emerald-900 mb-3 uppercase tracking-wider text-[10px]">
                    Tóm tắt đơn hàng
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Sản phẩm</span>
                      <span className="font-medium text-gray-900">
                        {formatVND(offerPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí giao hàng</span>
                      <span className="text-gray-500 font-medium">
                        Miễn phí
                      </span>
                    </div>
                    <Separator className="my-2 bg-emerald-100" />
                    <div className="flex justify-between text-xs font-bold text-gray-900">
                      <span>Tổng cộng</span>
                      <span className="text-emerald-600 text-sm font-extrabold">
                        {formatVND(offerPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50/50 px-6 py-4 border-t border-gray-100 gap-2 sm:justify-end">
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
            onClick={step === "address" ? handleContinue : handleConfirm}
            disabled={
              isPending ||
              (step === "address" &&
                (!address.name?.trim() ||
                  !address.phone?.trim() ||
                  !address.province ||
                  !address.district ||
                  !address.ward ||
                  !address.address_detail?.trim()))
            }
            className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {isPending
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

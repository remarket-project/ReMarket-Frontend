import { useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

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
import ShippingAddressForm from "./ShippingAddressForm"
import PaymentMethodSelector from "./PaymentMethodSelector"
import { OrdersService } from "@/client"
import type { PaymentMethod, ShippingAddressInput } from "@/client"
import { formatVND } from "@/lib/order-utils"

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
  const [step, setStep] = useState<"address" | "payment">("address")
  const [address, setAddress] = useState<ShippingAddressInput>(defaultAddress)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet")

  const buyMutation = useMutation({
    mutationFn: () =>
      OrdersService.createDirectOrderApiV1OrdersPost({
        requestBody: {
          listing_id: listingId,
          payment_method: paymentMethod,
          shipping_address: paymentMethod === "cod" || Object.values(address).some((v) => v)
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
      const msg =
        (err as { body?: { detail?: string } })?.body?.detail ||
        "Đặt hàng thất bại. Vui lòng thử lại."
      toast.error(msg)
    },
  })

  const handleConfirm = () => {
    if (step === "address") {
      if (paymentMethod === "cod") {
        if (!address.name || !address.phone || !address.province || !address.district || !address.ward || !address.address_detail) {
          toast.error("Vui lòng điền đầy đủ thông tin giao hàng")
          return
        }
      }
      setStep("payment")
      return
    }
    buyMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {step === "address" ? "Thông tin giao hàng" : "Xác nhận đặt hàng"}
          </DialogTitle>
          <DialogDescription>
            {step === "address"
              ? "Vui lòng nhập địa chỉ nhận hàng"
              : "Kiểm tra lại thông tin trước khi đặt hàng"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {step === "address" ? (
            <ShippingAddressForm value={address} onChange={setAddress} />
          ) : (
            <>
              <div className="rounded-lg border bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sản phẩm</span>
                  <span className="font-medium">{formatVND(price)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{formatVND(price)}</span>
                </div>
              </div>

              <div className="rounded-lg border p-3 text-sm">
                <p className="mb-1 font-medium">Địa chỉ giao hàng</p>
                <p className="text-gray-600">{address.name} - {address.phone}</p>
                <p className="text-gray-600">
                  {address.address_detail}, {address.ward}, {address.district}, {address.province}
                </p>
                {address.note && <p className="mt-1 text-gray-500">Ghi chú: {address.note}</p>}
              </div>

              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
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
            className="gap-2"
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
                  ? "Đặt hàng (Thanh toán từ ví)"
                  : "Đặt hàng (COD)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

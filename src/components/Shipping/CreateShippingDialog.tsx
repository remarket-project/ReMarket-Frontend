import { useMutation } from "@tanstack/react-query"
import { Loader2, MapPin, Package } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ShippingService } from "@/client"
import { extractErrorMessage } from "@/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatVND } from "@/lib/order-utils"

interface CreateShippingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: string
    final_price: string
    shipping_name?: string | null
    shipping_phone?: string | null
    shipping_province?: string | null
    shipping_district?: string | null
    shipping_ward?: string | null
    shipping_address_detail?: string | null
    shipping_note?: string | null
    shipping_province_id?: number | null
    shipping_district_id?: number | null
    shipping_ward_code?: string | null
    tracking_number?: string | null
  }
  onSuccess?: (trackingNumber: string) => void
}

export default function CreateShippingDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: CreateShippingDialogProps) {
  const [weight, setWeight] = useState(500)
  const [note, setNote] = useState(order.shipping_note || "")

  const createMutation = useMutation({
    mutationFn: () =>
      ShippingService.createShippingOrderApiV1ShippingCreateOrderPost({
        requestBody: {
          order_id: order.id,
          weight_grams: weight,
          insurance_value: Number(order.final_price),
          note,
        },
      }),
    onSuccess: (data) => {
      toast.success("Đã tạo đơn vận chuyển GHN!")
      onOpenChange(false)
      if (onSuccess && data.order_code) onSuccess(data.order_code)
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, "Tạo đơn vận chuyển thất bại"))
    },
  })

  const fullAddress = [
    order.shipping_address_detail,
    order.shipping_ward,
    order.shipping_district,
    order.shipping_province,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Tạo đơn vận chuyển GHN</DialogTitle>
          <DialogDescription>
            Xác nhận thông tin và tạo đơn giao hàng. Địa chỉ đã được lấy từ
            thông tin đặt hàng.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-gray-50 p-3 text-sm">
            <p className="mb-1 flex items-center gap-1 font-medium">
              <MapPin className="size-3.5" />
              Thông tin người nhận
            </p>
            <p className="text-gray-700">
              {order.shipping_name} - {order.shipping_phone}
            </p>
            <p className="mt-1 text-gray-600">{fullAddress}</p>
            {order.shipping_note && (
              <p className="mt-1 text-gray-500">
                Ghi chú: {order.shipping_note}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Cân nặng (gram)</Label>
            <Input
              type="number"
              min={100}
              max={50000}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
            <p className="text-xs text-gray-400">Mặc định: 500g</p>
          </div>

          <div className="space-y-1.5">
            <Label>Giá trị hàng hóa</Label>
            <Input value={formatVND(order.final_price)} disabled />
          </div>

          <div className="space-y-1.5">
            <Label>Ghi chú giao hàng</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ghi chú cho shipper..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="gap-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Package className="size-4" />
            )}
            Tạo đơn GHN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

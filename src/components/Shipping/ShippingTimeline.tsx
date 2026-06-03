import { Truck } from "lucide-react"

import { formatVND } from "@/lib/order-utils"

interface ShippingTimelineProps {
  trackingNumber: string | null | undefined
  shippingProvider: string | null | undefined
  shippingFee: string | null | undefined
  status: string
  deliveredAt: string | null | undefined
  expectedDeliveryAt?: string | null | undefined
  autoReleaseAt?: string | null | undefined
}

export default function ShippingTimeline({
  trackingNumber,
  shippingProvider,
  shippingFee,
  deliveredAt,
  expectedDeliveryAt,
  autoReleaseAt,
}: ShippingTimelineProps) {

  if (!trackingNumber) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-400">
        Chưa có thông tin vận chuyển
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-gray-50 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">Mã vận đơn:</span>
          <span className="font-mono text-blue-600">{trackingNumber}</span>
        </div>
        {shippingProvider && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-500">Đơn vị vận chuyển:</span>
            <span className="uppercase">{shippingProvider}</span>
          </div>
        )}
        {shippingFee && shippingFee !== "0" && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-500">Phí ship:</span>
            <span>{formatVND(shippingFee)}</span>
          </div>
        )}
        {expectedDeliveryAt && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-500">Dự kiến giao:</span>
            <span>{new Date(expectedDeliveryAt).toLocaleDateString("vi-VN")}</span>
          </div>
        )}
        {deliveredAt && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-500">Đã giao:</span>
            <span>{new Date(deliveredAt).toLocaleDateString("vi-VN")}</span>
          </div>
        )}
        {autoReleaseAt && (
          <div className="mt-1 flex items-center justify-between text-amber-600">
            <span>Tự động giải ngân:</span>
            <span>{new Date(autoReleaseAt).toLocaleDateString("vi-VN")}</span>
          </div>
        )}
      </div>

      <TrackingUrlLink trackingNumber={trackingNumber} />
    </div>
  )
}

function TrackingUrlLink({ trackingNumber }: { trackingNumber: string }) {
  const url = `https://donhang.ghn.vn/?order_code=${trackingNumber}`
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-blue-200 bg-blue-50 p-3 text-center text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
    >
      <Truck className="mr-1 inline-block size-4" />
      Theo dõi trên GHN
    </a>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReturnRequest {
  id: string
  status: string
  reason: string
  description?: string | null
  return_fee: number
  refund_amount: number
  return_tracking_number?: string | null
  return_carrier?: string | null
  created_at: string
  seller_responded_at?: string | null
  buyer_shipped_at?: string | null
  seller_received_at?: string | null
  refunded_at?: string | null
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ người bán phản hồi", color: "bg-yellow-500" },
  seller_approved: { label: "Người bán đã đồng ý. Vui lòng gửi hàng về.", color: "bg-green-500" },
  seller_rejected: { label: "Người bán từ chối", color: "bg-red-500" },
  awaiting_return: { label: "Chờ bạn gửi hàng", color: "bg-blue-500" },
  return_shipped: { label: "Hàng đang được gửi về", color: "bg-blue-500" },
  return_delivered: { label: "Người bán đã nhận hàng", color: "bg-green-500" },
  refunded: { label: "Đã hoàn tiền", color: "bg-green-500" },
  disputed: { label: "Đang tranh chấp — chờ admin giải quyết", color: "bg-red-500" },
  admin_resolved: { label: "Admin đã giải quyết", color: "bg-gray-500" },
}

function formatDate(value: string) {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export function ReturnStatusCard({ request }: { request: ReturnRequest }) {
  const s = statusMap[request.status] || { label: request.status, color: "bg-gray-500" }

  return (
    <Card className="mt-4 border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-lg">🔄</span> Yêu cầu hoàn hàng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className={`size-3 rounded-full ${s.color}`} />
          <span className="text-sm font-medium">{s.label}</span>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {request.created_at && (
            <div className="flex justify-between">
              <span>📝 Yêu cầu được gửi</span>
              <span>{formatDate(request.created_at)}</span>
            </div>
          )}
          {request.seller_responded_at && (
            <div className="flex justify-between">
              <span>📬 Người bán phản hồi</span>
              <span>{formatDate(request.seller_responded_at)}</span>
            </div>
          )}
          {request.buyer_shipped_at && (
            <div className="flex justify-between">
              <span>📦 Bạn đã gửi hàng</span>
              <span>{formatDate(request.buyer_shipped_at)}</span>
            </div>
          )}
          {request.refunded_at && (
            <div className="flex justify-between font-medium text-green-600">
              <span>💰 Đã hoàn tiền</span>
              <span>{formatDate(request.refunded_at)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

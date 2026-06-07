import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReturnRequestDialogProps {
  order: { id: string }
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const returnReasons = [
  { value: "wrong_item", label: "Người bán gửi sai hàng" },
  { value: "defective", label: "Hàng bị lỗi" },
  { value: "damaged", label: "Hàng bị hư hỏng" },
  { value: "not_as_described", label: "Không đúng mô tả" },
  { value: "fake", label: "Hàng giả / nhái" },
  { value: "no_longer_needed", label: "Không còn nhu cầu" },
]

export function ReturnRequestDialog({ order, open, onClose, onSuccess }: ReturnRequestDialogProps) {
  const [reason, setReason] = useState("defective")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch("/api/v1/returns/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: order.id,
          reason,
          description: description || null,
        }),
      })

      if (res.ok) {
        toast.success("Yêu cầu hoàn hàng đã được gửi!")
        onClose()
        onSuccess?.()
      } else {
        const err = await res.json()
        toast.error(err?.detail || "Không thể gửi yêu cầu")
      }
    } catch {
      toast.error("Lỗi kết nối")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yêu cầu trả hàng / Hoàn tiền</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Lý do hoàn hàng</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {returnReasons.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Mô tả vấn đề bạn gặp phải..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertTriangle className="size-4" />
            <AlertDescription className="text-xs">
              Sau khi gửi yêu cầu, người bán có 2 ngày để phản hồi.
              Nếu không phản hồi, yêu cầu sẽ tự động được chấp nhận.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, CheckCircle2, Upload } from "lucide-react"
import { toast } from "sonner"

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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface DisputeDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DisputeDialog({ orderId, open, onOpenChange }: DisputeDialogProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<"confirm" | "form">("confirm")
  const [reason, setReason] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const acceptMutation = useMutation({
    mutationFn: () =>
      (OrdersService as any).acceptOrderApiV1OrdersOrderIdAcceptPost?.({ orderId }) ??
      fetch(`/api/v1/orders/${orderId}/accept`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["wallet"] })
      toast.success("Đã xác nhận hoàn tất đơn hàng.")
      onOpenChange(false)
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể hoàn tất đơn hàng."),
  })

  const disputeMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("order_id", orderId)
      formData.append("reason", reason)
      files.forEach((file) => formData.append("evidence_images", file))
      return fetch("/api/v1/disputes", {
        method: "POST",
        body: formData,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      toast.success("Đã gửi khiếu nại thành công.")
      setStep("confirm")
      setReason("")
      setFiles([])
      onOpenChange(false)
    },
    onError: (error: any) =>
      toast.error(error?.body?.detail || "Không thể gửi khiếu nại."),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 5))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setStep("confirm")
          setReason("")
          setFiles([])
        }
        onOpenChange(val)
      }}
    >
      <DialogContent className="sm:max-w-md">
        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[#102A43]">
                <CheckCircle2 className="size-5 text-blue-600" />
                Xác nhận đã nhận hàng
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-sm text-[#5B7083]">
              Bạn có khiếu nại gì về đơn hàng này không?
            </DialogDescription>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                className="border-amber-200 text-amber-700"
                onClick={() => setStep("form")}
              >
                <AlertTriangle className="mr-2 size-4" />
                Có, tôi có khiếu nại
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending}
              >
                <CheckCircle2 className="mr-2 size-4" />
                {acceptMutation.isPending ? "Đang xử lý..." : "Không, hoàn tất đơn hàng"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="size-5" />
                Gửi khiếu nại
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Lý do khiếu nại *</Label>
                <Textarea
                  id="reason"
                  placeholder="Mô tả vấn đề của bạn..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evidence">Ảnh minh chứng (tối đa 5 ảnh)</Label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="evidence"
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#D8E2EF] px-4 py-2 text-sm text-[#5B7083] hover:border-blue-300 hover:text-blue-600"
                  >
                    <Upload className="size-4" />
                    Chọn ảnh
                  </label>
                  <input
                    id="evidence"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {files.length > 0 ? (
                    <span className="text-xs text-[#5B7083]">{files.length} ảnh</span>
                  ) : null}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep("confirm")}
              >
                Quay lại
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => disputeMutation.mutate()}
                disabled={disputeMutation.isPending || !reason.trim()}
              >
                {disputeMutation.isPending ? "Đang gửi..." : "Gửi khiếu nại"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

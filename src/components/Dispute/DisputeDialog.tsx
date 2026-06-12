import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, CheckCircle2, Loader2, Upload, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { DisputesService } from "@/client"
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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

interface DisputeDialogProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultStep?: "confirm" | "form"
}

export function DisputeDialog({
  orderId,
  open,
  onOpenChange,
  defaultStep = "confirm",
}: DisputeDialogProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<"confirm" | "form">(defaultStep)

  useEffect(() => {
    if (open) setStep(defaultStep)
  }, [open, defaultStep])
  const [reason, setReason] = useState("")
  const [reasonError, setReasonError] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/v1/orders/${orderId}/accept`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      queryClient.invalidateQueries({ queryKey: ["orders-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["wallet"] })
      queryClient.invalidateQueries({ queryKey: ["wallet-dashboard"] })
      toast.success("Đã xác nhận hoàn tất đơn hàng.")
      onOpenChange(false)
    },
    onError: (error: any) => {
      const detail = error?.body?.detail
      const msg = Array.isArray(detail) ? detail[0]?.msg : detail
      toast.error(msg || error.message || "Không thể hoàn tất đơn hàng.")
    },
  })

  const [uploading, setUploading] = useState(false)

  const disputeMutation = useMutation({
    mutationFn: async () => {
      setUploading(true)
      try {
        const imageUrls: string[] = []
        if (files.length > 0) {
          for (const file of files) {
            const uploadFormData = new FormData()
            uploadFormData.append("file", file)
            const token = localStorage.getItem("access_token")
            const res = await fetch(`${API_BASE}/api/v1/upload`, {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: uploadFormData,
            })
            if (!res.ok) throw new Error("Upload ảnh thất bại")
            const data = await res.json()
            imageUrls.push(data.url)
          }
        }
        await DisputesService.createDisputeApiV1DisputesPost({
          requestBody: {
            order_id: orderId,
            reason: reason,
            evidence_images: imageUrls,
          },
        })
      } finally {
        setUploading(false)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] })
      toast.success("Đã gửi khiếu nại thành công.")
      setStep("confirm")
      setReason("")
      setReasonError("")
      setFiles([])
      onOpenChange(false)
    },
    onError: (error: any) => {
      const detail = error?.body?.detail
      const msg = Array.isArray(detail) ? detail[0]?.msg : detail
      toast.error(msg || error.message || "Không thể gửi khiếu nại.")
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - files.length)
      setFiles((prev) => [...prev, ...newFiles].slice(0, 5))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    )
    setFiles((prev) => [...prev, ...dropped].slice(0, 5))
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setStep(defaultStep)
          setReason("")
          setReasonError("")
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
                {acceptMutation.isPending
                  ? "Đang xử lý..."
                  : "Không, hoàn tất đơn hàng"}
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
                  placeholder="Mô tả vấn đề của bạn (tối thiểu 10 ký tự)..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)
                    if (e.target.value.length >= 10) setReasonError("")
                  }}
                  rows={4}
                  className={reasonError ? "border-red-500" : ""}
                />
                {reason.trim().length > 0 && reason.trim().length < 10 && (
                  <p className="text-xs text-amber-600">
                    Cần ít nhất 10 ký tự (hiện tại: {reason.trim().length})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Ảnh minh chứng (tối đa 5 ảnh)</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors ${
                    dragOver
                      ? "border-blue-400 bg-blue-50/10"
                      : "border-[#D8E2EF] hover:border-blue-300 hover:bg-slate-50/5"
                  }`}
                >
                  <Upload className="size-6 text-[#5B7083]" />
                  <p className="text-sm font-medium text-[#5B7083]">
                    Kéo thả ảnh vào đây
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    hoặc nhấp để chọn (tối đa 5 ảnh)
                  </p>
                  <input
                    ref={fileInputRef}
                    id="evidence"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {files.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="group relative aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Ảnh ${idx + 1}`}
                          className="size-full rounded-lg border border-[#D8E2EF] object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(idx)
                          }}
                          className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    {files.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[#D8E2EF] text-[#94A3B8] transition-colors hover:border-blue-300 hover:text-blue-500"
                      >
                        <Upload className="size-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("confirm")}>
                Quay lại
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => disputeMutation.mutate()}
                disabled={
                  disputeMutation.isPending ||
                  uploading ||
                  !reason.trim() ||
                  reason.trim().length < 10
                }
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang tải ảnh...
                  </>
                ) : disputeMutation.isPending ? (
                  "Đang gửi..."
                ) : (
                  "Gửi khiếu nại"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

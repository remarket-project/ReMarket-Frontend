import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

const schema = z.object({
  reason: z.string().min(10, "Vui lòng nhập ít nhất 10 ký tự."),
})

type FormData = z.infer<typeof schema>

const reasons = [
  "Chưa nhận được sản phẩm",
  "Sản phẩm không đúng mô tả",
  "Sản phẩm bị hư hỏng",
  "Người bán không phản hồi",
]

interface OpenDisputeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reason: string) => void
  isPending?: boolean
}

export default function OpenDisputeDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}: OpenDisputeDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  })

  const submit = (data: FormData) => onSubmit(data.reason)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mở tranh chấp</DialogTitle>
          <DialogDescription>
            Thao tác này sẽ đóng băng tài khoản bảo chứng (escrow) và thông báo
            cho ban quản trị xem xét.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Lý do *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-2"
                    >
                      {reasons.map((reason) => (
                        <label
                          key={reason}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm"
                        >
                          <RadioGroupItem value={reason} />
                          <span>{reason}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Mô tả chi tiết hơn về vấn đề của bạn..."
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rmk-glow-button"
                disabled={isPending}
              >
                Gửi yêu cầu tranh chấp
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

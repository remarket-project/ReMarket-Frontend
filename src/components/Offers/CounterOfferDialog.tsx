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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const schema = z.object({
  offer_price: z.number().positive(),
  note: z.string().optional(),
})

function formatCurrency(price: string | number) {
  const numeric = Number(price)
  if (Number.isNaN(numeric)) return `${price} đ`
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numeric)
}

type FormData = z.infer<typeof schema>

interface CounterOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listedPrice: number
  buyerOffer: number
  onSubmit: (value: number) => void
  isPending?: boolean
}

export default function CounterOfferDialog({
  open,
  onOpenChange,
  listedPrice,
  buyerOffer,
  onSubmit,
  isPending = false,
}: CounterOfferDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      offer_price: listedPrice,
      note: "",
    },
  })

  const handleSubmit = (data: FormData) => {
    onSubmit(data.offer_price)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đưa ra giá phản hồi</DialogTitle>
          <DialogDescription>
            Giá niêm yết: {formatCurrency(listedPrice)} • Người mua đề nghị: {formatCurrency(buyerOffer)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="offer_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mức giá phản hồi của bạn *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value || 0))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Cảm ơn bạn đã quan tâm. Tôi có thể nhượng lại với giá này..."
                      {...field}
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
                Gửi giá phản hồi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

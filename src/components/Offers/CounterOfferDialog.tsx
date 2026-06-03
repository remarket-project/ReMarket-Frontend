import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftRight } from "lucide-react"
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
  offer_price: z.number().positive("Giá phải lớn hơn 0"),
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
  listingTitle?: string
}

export default function CounterOfferDialog({
  open,
  onOpenChange,
  listedPrice,
  buyerOffer,
  onSubmit,
  isPending = false,
  listingTitle,
}: CounterOfferDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      offer_price: listedPrice,
      note: "",
    },
  })

  const currentPrice = form.watch("offer_price")
  const diffFromListed = listedPrice > 0 ? Math.round((currentPrice / listedPrice) * 100) : 0
  const diffFromBuyer = buyerOffer > 0 ? Math.round(((currentPrice - buyerOffer) / buyerOffer) * 100) : 0

  const handleSubmit = (data: FormData) => {
    onSubmit(data.offer_price)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-950">
            <ArrowLeftRight className="size-5 text-violet-700" />
            Phản hồi đề nghị
          </DialogTitle>
          <DialogDescription className="text-blue-900/70">
            {listingTitle
              ? `Phản hồi đề nghị cho "${listingTitle}"`
              : "Đưa ra mức giá của bạn cho người mua"}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-violet-200/70 bg-violet-50/60 p-3 space-y-2">
          <p className="text-xs font-semibold text-violet-800 mb-2">
            Lịch sử thương lượng
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-violet-900/70">Giá niêm yết</span>
            <span className="font-bold text-violet-950">
              {formatCurrency(listedPrice)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-violet-900/70">Người mua đề nghị</span>
            <span className="font-semibold text-amber-700">
              {formatCurrency(buyerOffer)}
            </span>
          </div>
          <div className="border-t border-violet-200/50 pt-2 flex items-center justify-between text-xs">
            <span className="text-violet-900/70 font-medium">Giá bạn đề xuất</span>
            <span className="font-bold text-emerald-700">
              {formatCurrency(currentPrice || 0)}
            </span>
          </div>
        </div>

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
                  <FormLabel className="text-blue-900/80">
                    Mức giá phản hồi của bạn *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value || 0))
                        }
                        className="border-violet-200 bg-white pr-8"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-violet-700">
                        đ
                      </span>
                    </div>
                  </FormControl>
                  {currentPrice > 0 && (
                    <div className="flex gap-2 mt-1">
                      <span
                        className={`text-xs font-medium ${
                          diffFromListed >= 85
                            ? "text-emerald-600"
                            : diffFromListed >= 70
                              ? "text-amber-600"
                              : "text-rose-600"
                        }`}
                      >
                        {diffFromListed}% so với giá niêm yết
                      </span>
                      {diffFromBuyer !== 0 && (
                        <span
                          className={`text-xs font-medium ${
                            diffFromBuyer > 0 ? "text-amber-600" : "text-rose-600"
                          }`}
                        >
                          ({diffFromBuyer > 0 ? "+" : ""}
                          {diffFromBuyer}% so với đề nghị của người mua)
                        </span>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900/80">
                    Ghi chú <span className="text-blue-900/50">(tùy chọn)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Cảm ơn bạn đã quan tâm. Tôi có thể nhượng lại với giá này..."
                      className="border-violet-200 bg-white"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="rounded-xl border border-violet-200/50 bg-violet-50/40 p-3 text-xs text-violet-900/70">
              🛡️ Nếu người mua chấp nhận giá này, đơn hàng sẽ tự động được tạo.
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-violet-200"
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

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Handshake, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { ChatsService, OffersService } from "@/client"
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

const offerSchema = z.object({
  offer_price: z
    .number({ message: "Vui lòng nhập mức giá hợp lệ" })
    .positive("Đề nghị giá phải lớn hơn 0")
    .min(1000, "Giá đề nghị tối thiểu là 1,000đ"),
  message: z.string().optional(),
})

type OfferFormData = z.infer<typeof offerSchema>

interface MakeOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId: string
  listingTitle: string
  listedPrice: string
  conversationId?: string
}

export function MakeOfferDialog({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  listedPrice,
  conversationId,
}: MakeOfferDialogProps) {
  const queryClient = useQueryClient()
  const listedNum = Number(listedPrice)

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      offer_price: undefined,
      message: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: OfferFormData) =>
      OffersService.createOfferApiV1OffersPost({
        requestBody: {
          listing_id: listingId,
          offer_price: data.offer_price,
        },
      }),
    onSuccess: (_, variables) => {
      toast.success(
        "Đã gửi đề nghị thành công! Người bán sẽ nhận được thông báo.",
      )
      queryClient.invalidateQueries({ queryKey: ["listing-offers", listingId] })
      queryClient.invalidateQueries({ queryKey: ["offers-dashboard"] })

      if (conversationId) {
        const formattedPrice = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(variables.offer_price)
        ChatsService.sendMessageApiV1ChatsConversationsConversationIdMessagesPost(
          {
            conversationId,
            requestBody: {
              content: `Mình đã gửi đề nghị ${formattedPrice} cho bạn.`,
            },
          },
        )
      }

      form.reset()
      onOpenChange(false)
    },
    onError: (err: any) => {
      toast.error(extractErrorMessage(err, "Không thể gửi đề nghị. Vui lòng thử lại."))
    },
  })

  const offerPrice = form.watch("offer_price")
  const pctOfListed =
    listedNum > 0 && offerPrice > 0
      ? Math.round((offerPrice / listedNum) * 100)
      : null

  function onSubmit(data: OfferFormData) {
    mutation.mutate(data)
  }

  const formatVND = (v: string) => {
    const n = Number(v)
    if (Number.isNaN(n)) return `${v} đ`
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(n)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-950">
            <Handshake className="size-5 text-blue-700" />
            Đưa ra đề nghị
          </DialogTitle>
          <DialogDescription className="text-blue-900/70">
            Bạn đang đưa ra đề nghị cho{" "}
            <span className="font-semibold text-blue-900">{listingTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Listed price context */}
        <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-blue-900/70">Giá niêm yết</span>
            <span className="font-bold text-blue-950">
              {formatVND(listedPrice)}
            </span>
          </div>
          {pctOfListed !== null && (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-blue-900/60 text-xs">Đề nghị của bạn</span>
              <span
                className={`text-xs font-semibold ${
                  pctOfListed >= 90
                    ? "text-emerald-700"
                    : pctOfListed >= 70
                      ? "text-amber-700"
                      : "text-rose-700"
                }`}
              >
                {pctOfListed}% so với giá niêm yết
              </span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="offer_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900/80">
                    Mức giá đề nghị của bạn *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Nhập mức giá đề xuất"
                        className="border-blue-200 bg-white pr-8 animate-none"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-blue-700">
                        đ
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900/80">
                    Lời nhắn cho người bán{" "}
                    <span className="text-blue-900/50">(tùy chọn)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Xin chào, tôi rất quan tâm đến sản phẩm này. Bạn có cân nhắc giá..."
                      className="border-blue-200 bg-white"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-xl border border-blue-200/50 bg-blue-50/40 p-3 text-xs text-blue-900/70">
              🛡️ Đề nghị của bạn được bảo vệ. Nếu được chấp nhận, thanh toán sẽ
              đi qua tài khoản bảo chứng (escrow) và chỉ giải ngân sau khi xác
              nhận nhận hàng.
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-blue-200"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rmk-glow-button"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Handshake className="mr-2 size-4" />
                    Gửi đề nghị
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

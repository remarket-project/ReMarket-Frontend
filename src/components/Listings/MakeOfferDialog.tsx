import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Handshake, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { OffersService } from "@/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const offerSchema = z.object({
  offer_price: z
    .number({ message: "Please enter a valid price" })
    .positive("Offer must be greater than 0"),
  message: z.string().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface MakeOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  listedPrice: string;
}

export function MakeOfferDialog({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  listedPrice,
}: MakeOfferDialogProps) {
  const queryClient = useQueryClient();
  const listedNum = Number(listedPrice);

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      offer_price: undefined,
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: OfferFormData) =>
      OffersService.createOfferApiV1OffersPost({
        requestBody: {
          listing_id: listingId,
          offer_price: data.offer_price,
        },
      }),
    onSuccess: () => {
      toast.success("Offer submitted successfully! The seller will be notified.");
      queryClient.invalidateQueries({ queryKey: ["listing-offers", listingId] });
      form.reset();
      onOpenChange(false);
    },
    onError: (err: any) => {
      const msg =
        err?.body?.detail || "Failed to submit offer. Please try again.";
      toast.error(msg);
    },
  });

  const offerPrice = form.watch("offer_price");
  const pctOfListed =
    listedNum > 0 && offerPrice > 0
      ? Math.round((offerPrice / listedNum) * 100)
      : null;

  function onSubmit(data: OfferFormData) {
    mutation.mutate(data);
  }

  const formatUSD = (v: string) => {
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-950">
            <Handshake className="size-5 text-blue-700" />
            Make an Offer
          </DialogTitle>
          <DialogDescription className="text-blue-900/70">
            You're making an offer on{" "}
            <span className="font-semibold text-blue-900">{listingTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Listed price context */}
        <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-blue-900/70">Listed price</span>
            <span className="font-bold text-blue-950">{formatUSD(listedPrice)}</span>
          </div>
          {pctOfListed !== null && (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-blue-900/60 text-xs">Your offer</span>
              <span
                className={`text-xs font-semibold ${
                  pctOfListed >= 90
                    ? "text-emerald-700"
                    : pctOfListed >= 70
                    ? "text-amber-700"
                    : "text-rose-700"
                }`}
              >
                {pctOfListed}% of listed price
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
                    Your offer price *
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-blue-700">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Enter your offer"
                        className="border-blue-200 bg-white pl-7"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? undefined : Number(e.target.value)
                          )
                        }
                      />
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
                    Message to seller{" "}
                    <span className="text-blue-900/50">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Hi, I'm interested in this item. Can you consider..."
                      className="border-blue-200 bg-white"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-xl border border-blue-200/50 bg-blue-50/40 p-3 text-xs text-blue-900/70">
              🛡️ Your offer is protected. If accepted, payment goes through
              escrow and is released only after delivery confirmation.
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-blue-200"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rmk-glow-button"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Handshake className="mr-2 size-4" />
                    Submit Offer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import StripePaymentForm from "@/components/Stripe/StripePaymentForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PaymentService } from "@/client";

const frontendStripePublishableKey = (
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? ""
).trim();

interface WalletTopupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  clientSecret: string | null;
  onCreatePaymentIntent: (amount: number) => void;
  isCreating: boolean;
}

const presetAmounts = [50000, 100000, 200000, 500000];

function formatCurrency(price: string | number) {
  const numeric = Number(price);
  if (Number.isNaN(numeric)) return `${price} đ`;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export default function WalletTopupDialog({
  open,
  onOpenChange,
  currentBalance,
  clientSecret,
  onCreatePaymentIntent,
  isCreating,
}: WalletTopupDialogProps) {
  const [amount, setAmount] = useState<number>(100000);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [loadingKey, setLoadingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !clientSecret || publishableKey || loadingKey) {
      return;
    }

    setKeyError(null);

    if (frontendStripePublishableKey) {
      setPublishableKey(frontendStripePublishableKey);
      setStripePromise(
        loadStripe(frontendStripePublishableKey, {
          developerTools: {
            assistant: {
              enabled: false,
            },
          },
        })
      );
      return;
    }

    setLoadingKey(true);
    PaymentService.getStripeConfigApiV1PaymentConfigGet()
      .then((res) => {
        const publishableKeyFromBackend = (res.publishable_key ?? "").trim();
        if (!publishableKeyFromBackend) {
          setKeyError("Thiếu khóa Stripe Publishable Key ở Backend");
          return;
        }

        setPublishableKey(publishableKeyFromBackend);
        setStripePromise(
          loadStripe(publishableKeyFromBackend, {
            developerTools: {
              assistant: {
                enabled: false,
              },
            },
          })
        );
      })
      .catch((err) => {
        console.error(err);
        setKeyError("Không thể tải cấu hình Stripe từ Backend");
      })
      .finally(() => {
        setLoadingKey(false);
      });
  }, [open, clientSecret, publishableKey, loadingKey]);

  const handleClose = (val: boolean) => {
    if (!val) {
      setAmount(100000);
    }
    onOpenChange(val);
  };

  const handlePaymentSuccess = () => {
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nạp tiền vào ví</DialogTitle>
          <DialogDescription>
            Thanh toán qua Stripe (thẻ test: 4242 4242 4242 4242).
          </DialogDescription>
        </DialogHeader>

        {!clientSecret ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-sm text-blue-900/75">
              Số dư hiện tại:{" "}
              <span className="font-semibold text-blue-950">
                {formatCurrency(currentBalance)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? "default" : "outline"}
                  className={amount === preset ? "rmk-glow-button" : ""}
                  onClick={() => setAmount(preset)}
                  style={{ fontSize: "11px", padding: "0 4px" }}
                >
                  {formatCurrency(preset)}
                </Button>
              ))}
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-900/70">
                Số tiền khác
              </p>
              <Input
                type="number"
                min={1}
                max={100000000}
                step={1000}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value || 0))}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="rmk-glow-button flex-1"
                disabled={isCreating || amount <= 0}
                onClick={() => onCreatePaymentIntent(amount)}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  `Nạp ${formatCurrency(amount)}`
                )}
              </Button>
            </div>
          </div>
        ) : loadingKey ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="size-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Đang tải cấu hình Stripe...</p>
          </div>
        ) : keyError ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p className="font-semibold mb-1 text-red-900 flex items-center gap-1.5">
                ⚠️ Lỗi cấu hình Stripe
              </p>
              <p className="text-xs text-red-700 leading-relaxed">{keyError}</p>
              <p className="text-xs text-red-700 leading-relaxed mt-2">
                <strong>Cách khắc phục:</strong>
                <ol className="list-decimal pl-4 mt-1 space-y-1">
                  <li>
                    Kiểm tra file <code>.env</code> của Backend trên VPS (
                    <code>/opt/remarket/ReMarket-Backend/.env</code>) hoặc file{" "}
                    <code>.env</code> gốc.
                  </li>
                  <li>
                    Đảm bảo đã khai báo khóa:{" "}
                    <code>STRIPE_PUBLISHABLE_KEY=pk_test_...</code>
                  </li>
                  <li>
                    Khởi động lại Backend bằng lệnh:{" "}
                    <code>
                      docker compose -f docker-compose.prod.yml restart backend
                    </code>
                  </li>
                </ol>
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              className="w-full"
            >
              Đóng
            </Button>
          </div>
        ) : stripePromise ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <StripePaymentForm
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={(msg) => alert(msg)}
              onCancel={() => handleClose(false)}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

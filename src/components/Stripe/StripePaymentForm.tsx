import { useState } from "react"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface StripePaymentFormProps {
  clientSecret: string
  onSuccess: () => void
  onError: (message: string) => void
  onCancel: () => void
}

export default function StripePaymentForm({
  clientSecret,
  onSuccess,
  onError,
  onCancel,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/wallet`,
      },
      redirect: "if_required",
    })

    if (error) {
      onError(error.message ?? "Thanh toán thất bại")
      setIsLoading(false)
      return
    }

    onSuccess()
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Thanh toán
        </Button>
      </div>
    </form>
  )
}

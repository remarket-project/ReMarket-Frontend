import { useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected/escrow/$orderId")({
  component: EscrowRedirect,
  head: () => ({
    meta: [{ title: "Escrow - ReMarket" }],
  }),
})

function EscrowRedirect() {
  const { orderId } = Route.useParams()
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: "/orders/$orderId", params: { orderId }, replace: true })
  }, [orderId, navigate])

  return (
    <div className="flex items-center justify-center py-20 text-slate-500">
      Đang chuyển hướng đến chi tiết đơn hàng...
    </div>
  )
}

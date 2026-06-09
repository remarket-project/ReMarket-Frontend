import { useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/escrow")({
  component: EscrowRedirect,
})

function EscrowRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: "/admin/disputes", replace: true })
  }, [navigate])

  return (
    <div className="flex items-center justify-center py-20 text-slate-500">
      Đang chuyển hướng đến trang xử lý khiếu nại...
    </div>
  )
}

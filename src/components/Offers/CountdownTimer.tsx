import { Clock3 } from "lucide-react"
import { useEffect, useState } from "react"

interface CountdownTimerProps {
  expiresAt: string
}

function calcRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    total: diff,
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => calcRemaining(expiresAt))

  useEffect(() => {
    const timer = setInterval(() => {
      const rem = calcRemaining(expiresAt)
      setRemaining(rem)
      if (rem.total <= 0) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  if (remaining.total <= 0) {
    return (
      <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
        <Clock3 className="size-3.5" />
        Đã hết hạn xác nhận
      </p>
    )
  }

  return (
    <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
      <Clock3 className="size-3.5" />
      Còn {remaining.hours}g {remaining.minutes}p {remaining.seconds}s để xác
      nhận đặt hàng
    </p>
  )
}

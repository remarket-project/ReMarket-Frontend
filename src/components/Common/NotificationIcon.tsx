import {
  ArrowLeftRight,
  BadgeCheck,
  CheckCircle2,
  Handshake,
  PackageCheck,
  RotateCcw,
  Scale,
  ShoppingCart,
  Star,
  Truck,
  Wallet,
  XCircle,
  XOctagon,
} from "lucide-react"

import type { NotificationType } from "@/client"

interface NotificationIconProps {
  type: NotificationType
}

const iconMap: Record<NotificationType, { icon: any; className: string }> = {
  listing_approved: { icon: BadgeCheck, className: "text-emerald-700" },
  listing_rejected: { icon: XOctagon, className: "text-rose-700" },
  offer_received: { icon: Handshake, className: "text-blue-700" },
  offer_accepted: { icon: CheckCircle2, className: "text-emerald-700" },
  offer_rejected: { icon: XCircle, className: "text-rose-700" },
  offer_countered: { icon: ArrowLeftRight, className: "text-amber-700" },
  offer_expired: { icon: XCircle, className: "text-zinc-600" },
  order_created: { icon: ShoppingCart, className: "text-blue-700" },
  order_accepted: { icon: Handshake, className: "text-violet-700" },
  order_auto_completed: { icon: PackageCheck, className: "text-emerald-700" },
  order_shipping: { icon: Truck, className: "text-sky-700" },
  order_delivered: { icon: PackageCheck, className: "text-indigo-700" },
  order_completed: { icon: PackageCheck, className: "text-emerald-700" },
  order_cancelled: { icon: XCircle, className: "text-rose-700" },
  order_status_updated: { icon: ShoppingCart, className: "text-blue-700" },
  dispute_opened: { icon: Scale, className: "text-amber-700" },
  dispute_resolved: { icon: Scale, className: "text-emerald-700" },
  shipping_created: { icon: Truck, className: "text-sky-700" },
  shipping_delivered: { icon: Truck, className: "text-indigo-700" },
  return_requested: { icon: RotateCcw, className: "text-orange-700" },
  return_confirmed: { icon: RotateCcw, className: "text-emerald-700" },
  review_received: { icon: Star, className: "text-amber-700" },
  wallet_balance_updated: { icon: Wallet, className: "text-violet-700" },
  wallet_locked: { icon: Wallet, className: "text-amber-700" },
  wallet_released: { icon: Wallet, className: "text-emerald-700" },
}

export default function NotificationIcon({ type }: NotificationIconProps) {
  const config = iconMap[type]
  const Icon = config.icon
  return <Icon className={`size-4 ${config.className}`} />
}

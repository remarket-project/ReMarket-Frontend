export interface Province {
  province_id: number
  province_name: string
}

export interface District {
  district_id: number
  district_name: string
}

export interface Ward {
  ward_code: string
  ward_name: string
}

export interface ShippingService {
  service_id: number
  short_name: string
  service_type_id: number
}

export interface ShippingFee {
  total: number
  service_fee: number
  insurance_fee: number
  vat: number
}

function differenceInDays(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export const SHIPPING_STATUS_LABELS: Record<string, string> = {
  ready_to_pick: "Chờ lấy hàng",
  picking: "Đang lấy hàng",
  picked: "Đã lấy hàng",
  delivering: "Đang giao",
  delivered: "Đã giao hàng",
  delivery_fail: "Giao thất bại",
  waiting_to_return: "Chờ hoàn",
  return: "Đang hoàn",
  returning: "Đang trả hàng",
  returned: "Đã hoàn trả",
  cancel: "Đã hủy",
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  shipping: "Đang vận chuyển",
  delivered: "Đã giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  returning: "Đang hoàn trả",
  returned: "Đã hoàn trả",
}

export function canRequestReturn(order: {
  status: string;
  payment_method?: string | null;
  delivered_at?: string | null;
}): boolean {
  if (order.payment_method !== "wallet") return false;
  if (order.status !== "delivered") return false;
  if (!order.delivered_at) return false;
  const daysSinceDelivery = differenceInDays(new Date(), new Date(order.delivered_at));
  return daysSinceDelivery <= 7;
}

export function formatShippingFee(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

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

export const SHIPPING_STATUS_LABELS: Record<string, string> = {
  ready_to_pick: "Chờ lấy hàng",
  picking: "Đang lấy hàng",
  picked: "Đã lấy hàng",
  delivering: "Đang giao",
  delivered: "Đã giao hàng",
  cancelled: "Đã hủy",
}

export function formatShippingFee(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ giao hàng",
  shipping: "Đang vận chuyển",
  delivered: "Đã giao hàng",
  returning: "Đang hoàn trả",
  returned: "Đã hoàn trả",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  disputed: "Đang khiếu nại",
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:
    "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] dark:border-[#F59E0B]/30 dark:bg-[#F59E0B]/10 dark:text-[#F59E0B]",
  shipping:
    "border-[#BAE6FD] bg-[#F0F9FF] text-[#0369A1] dark:border-[#0EA5E9]/30 dark:bg-[#0EA5E9]/10 dark:text-[#0EA5E9]",
  delivered:
    "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] dark:border-[#10B981]/30 dark:bg-[#10B981]/10 dark:text-[#10B981]",
  returning:
    "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] dark:border-[#F59E0B]/30 dark:bg-[#F59E0B]/10 dark:text-[#F59E0B]",
  returned:
    "border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] dark:border-[#10B981]/30 dark:bg-[#10B981]/10 dark:text-[#10B981]",
  completed:
    "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857] dark:border-[#059669]/30 dark:bg-[#059669]/10 dark:text-[#059669]",
  cancelled:
    "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] dark:border-[#EF4444]/30 dark:bg-[#EF4444]/10 dark:text-[#EF4444]",
  disputed:
    "border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] dark:border-[#F59E0B]/30 dark:bg-[#F59E0B]/10 dark:text-[#F59E0B]",
}

export function formatVND(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "–"
  const amount = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(amount)) return "–"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

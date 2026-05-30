import type { LucideIcon } from "lucide-react"

interface DashboardCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  changeText?: string
  trend?: "up" | "down" | "warning"
  onClick?: () => void
}

export function DashboardCard({ title, value, icon: Icon, changeText, trend, onClick }: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-[#D8E2EF] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#5B7083]">{title}</p>
          <h3 className="mt-1 text-3xl font-bold tracking-tight text-[#102A43]">{value}</h3>
          {changeText && (
            <p className={`mt-1 text-xs font-semibold ${
              trend === 'up' ? 'text-[#059669]' :
              trend === 'down' ? 'text-[#E11D48]' : 'text-[#D97706]'
            }`}>
              {changeText}
            </p>
          )}
        </div>
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
          trend === 'warning' ? 'bg-orange-50 text-[#D97706]' : 'bg-[#EFF6FF] text-[#2563EB]'
        }`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}

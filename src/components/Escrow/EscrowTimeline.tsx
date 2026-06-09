import { CheckCircle2, Lock, ShieldCheck, Unlock } from "lucide-react"
import type { EscrowRead } from "@/client"

interface EscrowTimelineProps {
  escrow: EscrowRead
}

function formatDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function EscrowTimeline({ escrow }: EscrowTimelineProps) {
  const steps = [
    {
      key: "created",
      label: "Escrow Created",
      description: "Agreement secured by system",
      icon: ShieldCheck,
      time: formatDate(escrow.created_at),
    },
    {
      key: "funded",
      label: "Buyer Funded",
      description: "Funds securely locked",
      icon: Lock,
      time: formatDate(escrow.funded_at),
    },
    {
      key: "released",
      label: "Funds Released",
      description: "Cash paid out to Seller",
      icon: Unlock,
      time: formatDate(escrow.released_at),
    },
  ]

  // Determine current active step
  let currentActiveIndex = 0
  if (escrow.released_at) {
    currentActiveIndex = 2
  } else if (escrow.funded_at) {
    currentActiveIndex = 1
  }

  return (
    <div className="relative pl-2 pt-2 space-y-0">
      {steps.map((step, idx) => {
        const reached = idx <= currentActiveIndex
        const IconComponent = step.time ? CheckCircle2 : step.icon
        const isCurrent = idx === currentActiveIndex

        return (
          <div key={step.key} className="flex gap-4 relative">
            {/* Timeline connectors */}
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full transition-colors duration-300 ${
                  reached
                    ? step.time
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                }`}
              >
                <IconComponent className="size-4" />
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`my-1.5 w-0.5 flex-1 min-h-[40px] transition-colors duration-300 ${
                    idx < currentActiveIndex ? "bg-emerald-500" : "bg-zinc-200"
                  }`}
                />
              )}
            </div>

            {/* Info details */}
            <div className="pb-6 pt-0.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <p
                  className={`text-sm font-bold transition-colors ${
                    reached ? "text-blue-950" : "text-zinc-400"
                  }`}
                >
                  {step.label}
                </p>
                {step.time && (
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {step.time}
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  reached ? "text-zinc-600" : "text-zinc-400"
                }`}
              >
                {step.description}
              </p>
              {isCurrent && !escrow.released_at && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100 mt-2">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Active Milestone
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

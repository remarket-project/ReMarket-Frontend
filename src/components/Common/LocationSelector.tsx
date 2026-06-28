import { MapPin } from "lucide-react"
import { useEffect, useState } from "react"

const REGION_BUTTONS = [
  { value: "hanoi", label: "Miền Bắc", shortLabel: "Bắc", color: "text-blue-600" },
  { value: "danang", label: "Miền Trung", shortLabel: "Trung", color: "text-emerald-600" },
  { value: "hcmc", label: "Miền Nam", shortLabel: "Nam", color: "text-amber-600" },
] as const

function getStoredRegion(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("rmk_region") || ""
}

function setStoredRegion(value: string) {
  localStorage.setItem("rmk_region", value)
  window.dispatchEvent(new Event("storage"))
}

export function mapFrontendRegionToApi(region: string): string | undefined {
  if (region === "hanoi") return "north"
  if (region === "hcmc") return "south"
  if (region === "danang") return "central"
  return undefined
}

export function LocationSelector() {
  const [selected, setSelected] = useState(getStoredRegion)

  useEffect(() => {
    const check = () => setSelected(getStoredRegion())
    window.addEventListener("storage", check)
    const interval = setInterval(check, 2000)
    return () => {
      window.removeEventListener("storage", check)
      clearInterval(interval)
    }
  }, [])

  const handleSelect = (value: string) => {
    const next = selected === value ? "" : value
    setSelected(next)
    setStoredRegion(next)
  }

  return (
    <div className="flex items-center gap-1.5">
      {REGION_BUTTONS.map((btn) => {
        const isActive = selected === btn.value
        return (
          <button
            key={btn.value}
            type="button"
            onClick={() => handleSelect(btn.value)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? `${btn.color} border-current bg-white shadow-sm`
                : "border-[#D8E2EF] bg-[#F8FAFC] text-[#5B7083] hover:bg-white hover:text-[#102A43]"
            }`}
          >
            <MapPin className="size-3" />
            {btn.label}
          </button>
        )
      })}
    </div>
  )
}

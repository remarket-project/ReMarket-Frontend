import { useLanguage } from "@/components/Common/LanguageProvider"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-blue-200/90 bg-white/85 p-1 shadow-sm",
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-semibold transition",
          language === "en"
            ? "bg-blue-600 text-white"
            : "text-blue-800 hover:bg-blue-100",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("vi")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-semibold transition",
          language === "vi"
            ? "bg-blue-600 text-white"
            : "text-blue-800 hover:bg-blue-100",
        )}
      >
        VI
      </button>
    </div>
  )
}

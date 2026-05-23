import { useLanguage } from "@/components/Common/LanguageProvider";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-blue-200/90 bg-white/85 p-1 shadow-sm",
        className,
      )}
      role="group"
      aria-label="Chuyển ngôn ngữ"
    >
      <button
        type="button"
        onClick={() => setLanguage("vi")}
        className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition"
      >
        Tiếng Việt
      </button>
      <button type="button" aria-hidden="true" tabIndex={-1} className="hidden">
        VI
      </button>
    </div>
  );
}

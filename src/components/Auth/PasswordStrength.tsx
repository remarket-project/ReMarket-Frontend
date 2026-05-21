import { Check, X } from "lucide-react"
import { useLanguage } from "@/components/Common/LanguageProvider"

interface PasswordStrengthProps {
  password?: string
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  const { language } = useLanguage()
  const isVi = language === "vi"

  if (!password) return null

  // Criteria
  const hasMinLength = password.length >= 8
  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  const criteria = [
    {
      label: isVi ? "Ít nhất 8 ký tự" : "At least 8 characters",
      met: hasMinLength,
    },
    {
      label: isVi ? "Chứa chữ thường (a-z)" : "Contains lowercase (a-z)",
      met: hasLowerCase,
    },
    {
      label: isVi ? "Chứa chữ hoa (A-Z)" : "Contains uppercase (A-Z)",
      met: hasUpperCase,
    },
    {
      label: isVi ? "Chứa chữ số (0-9)" : "Contains number (0-9)",
      met: hasNumber,
    },
    {
      label: isVi
        ? "Chứa ký tự đặc biệt (@, #...)"
        : "Contains special character",
      met: hasSymbol,
    },
  ]

  const score = criteria.filter((c) => c.met).length

  let strengthLabel = ""
  let strengthColor = "bg-gray-200"
  let textColor = "text-gray-500"

  if (score === 0) {
    strengthLabel = isVi ? "Quá ngắn" : "Too short"
    strengthColor = "bg-red-500"
    textColor = "text-red-500"
  } else if (score <= 2) {
    strengthLabel = isVi ? "Yếu" : "Weak"
    strengthColor = "bg-orange-500"
    textColor = "text-orange-500"
  } else if (score <= 4) {
    strengthLabel = isVi ? "Khá" : "Medium"
    strengthColor = "bg-blue-500"
    textColor = "text-blue-500"
  } else {
    strengthLabel = isVi ? "Mạnh" : "Strong"
    strengthColor = "bg-green-500"
    textColor = "text-green-500"
  }

  return (
    <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          {isVi ? "Độ mạnh mật khẩu:" : "Password strength:"}
        </span>
        <span className={`font-semibold ${textColor}`}>{strengthLabel}</span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-5 gap-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index <= score ? strengthColor : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <ul className="space-y-1 pt-1 text-[11px]">
        {criteria.map((item, idx) => (
          <li
            key={idx}
            className={`flex items-center gap-1.5 transition-colors ${
              item.met
                ? "text-green-600 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {item.met ? (
              <Check className="w-3.5 h-3.5 text-green-500 shrink-0 animate-in zoom-in-50 duration-150" />
            ) : (
              <X className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
            )}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

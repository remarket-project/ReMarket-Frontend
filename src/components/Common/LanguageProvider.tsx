import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type AppLanguage = "en" | "vi"

interface LanguageContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  toggleLanguage: () => void
}

const STORAGE_KEY = "rmk_language"

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("en")

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "en" || saved === "vi") {
      setLanguage(saved)
    }
  }, [])

  const updateLanguage = (next: AppLanguage) => {
    setLanguage(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage: updateLanguage,
      toggleLanguage: () => updateLanguage(language === "en" ? "vi" : "en"),
    }),
    [language, updateLanguage],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

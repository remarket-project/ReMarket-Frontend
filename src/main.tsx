import { QueryClientProvider } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { LanguageProvider } from "./components/Common/LanguageProvider"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"

import { OpenAPI } from "./client"
import { queryClient } from "./lib/query-client"
import { refreshAccessToken } from "./lib/tokenRefresh"
import { routeTree } from "./routeTree.gen"

const apiBase = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL as string)
      .replace(/\/+$/, "")
      .replace(/\/api\/v1$/i, "")
  : ""

OpenAPI.BASE = apiBase
OpenAPI.TOKEN = async () => {
  let token = localStorage.getItem("access_token")
  if (token) {
    try {
      const payloadBase64 = token.split(".")[1]
      const decoded = JSON.parse(atob(payloadBase64))
      const exp = decoded.exp * 1000
      const now = Date.now()

      if (exp - now < 30 * 1000) {
        const newToken = await refreshAccessToken()
        if (newToken) {
          token = newToken
        }
      }
    } catch (_e) {
      // Ignore decoding errors, return original token
    }
  }
  return token || ""
}

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

if (localStorage.getItem("vite-ui-theme") === "dark") {
  localStorage.setItem("vite-ui-theme", "light")
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster richColors closeButton />
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)

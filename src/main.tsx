import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { ApiError, OpenAPI } from "./client"
import { LanguageProvider } from "./components/Common/LanguageProvider"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import "./index.css"
import { routeTree } from "./routeTree.gen"

import { refreshAccessToken } from "./lib/tokenRefresh"

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
      const exp = decoded.exp * 1000 // Convert to ms
      const now = Date.now()
      
      // If expired or about to expire in less than 30 seconds, try to refresh
      if (exp - now < 30 * 1000) {
        const newToken = await refreshAccessToken()
        if (newToken) {
          token = newToken
        }
      }
    } catch (e) {
      // Ignore decoding errors, return original token
    }
  }
  return token || ""
}

const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    window.location.href = "/login"
  }
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// Đảm bảo đồng bộ giao diện sáng (Light Mode) theo yêu cầu của người dùng
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

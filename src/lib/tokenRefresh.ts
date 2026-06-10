import { AuthService } from "@/client"

let isRefreshing = false
let pendingRequests: Array<(token: string | null) => void> = []

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) {
    return null
  }

  if (isRefreshing) {
    return new Promise((resolve) => {
      pendingRequests.push(resolve)
    })
  }

  isRefreshing = true

  try {
    const response = await AuthService.refreshAccessTokenApiV1AuthRefreshPost({
      requestBody: { refresh_token: refreshToken },
    })

    const newAccessToken = response.access_token
    const newRefreshToken = response.refresh_token

    localStorage.setItem("access_token", newAccessToken)
    if (newRefreshToken) {
      localStorage.setItem("refresh_token", newRefreshToken)
    }

    pendingRequests.forEach((callback) => callback(newAccessToken))
    pendingRequests = []
    return newAccessToken
  } catch (_error) {
    // Refresh failed or token expired
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    pendingRequests.forEach((callback) => callback(null))
    pendingRequests = []
    // Redirect to login if in browser environment
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  } finally {
    isRefreshing = false
  }
}

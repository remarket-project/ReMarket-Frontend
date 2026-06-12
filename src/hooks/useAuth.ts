import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import {
  type Body_login_login_access_token as AccessToken,
  ApiError,
  LoginService,
  type UserRegister,
  UsersService,
} from "@/client"
import { handleError } from "@/utils"
import useCustomToast from "./useCustomToast"

const isLoggedIn = () => {
  const token = localStorage.getItem("access_token")
  return typeof token === "string" && token.trim().length > 0
}

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()

  const { data: user } = useQuery<any, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn(),
    staleTime: 30_000,
  })

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),
    onSuccess: () => {
      // Handled in component
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const login = async (data: AccessToken) => {
    const response = await LoginService.loginAccessToken({
      formData: data,
    })
    localStorage.setItem("access_token", response.access_token)
    if (response.refresh_token) {
      localStorage.setItem("refresh_token", response.refresh_token)
    }
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      const searchParams = new URLSearchParams(window.location.search)
      const redirectTo = searchParams.get("redirect") || "/"
      const resolvedRedirect = (() => {
        try {
          const url = new URL(redirectTo, window.location.origin)
          return `${url.pathname}${url.search}${url.hash}`
        } catch {
          return redirectTo
        }
      })()

      try {
        const currentUser = await UsersService.readUserMe()
        queryClient.setQueryData(["currentUser"], currentUser)
        const isAdmin = currentUser.role === "admin"

        if (isAdmin) {
          const target = resolvedRedirect.startsWith("/admin")
            ? resolvedRedirect
            : "/admin/dashboard"
          navigate({ to: target as "/" })
          return
        }

        if (resolvedRedirect.startsWith("/admin")) {
          navigate({ to: "/" })
          return
        }
      } catch {
        // If profile fetch fails, fall back to the redirect param.
      }

      navigate({ to: resolvedRedirect as "/" })
    },
    onError: (error: any) => {
      if (error instanceof ApiError && error.status === 429) {
        showErrorToast("Dang nhap that bai. Vui long thu lai sau.")
        return
      }
      handleError.bind(showErrorToast)(error)
    },
  })

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    queryClient.clear()
    navigate({ to: "/login" })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
  }
}

export { isLoggedIn }
export default useAuth

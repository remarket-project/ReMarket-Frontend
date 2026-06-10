import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import ErrorComponent from "@/components/Common/ErrorComponent"
import NotFound from "@/components/Common/NotFound"
import { ChatProvider } from "@/hooks/ChatContext"
import { WebSocketProvider } from "@/providers/WebSocketProvider"

const showDevtools =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEVTOOLS === "true"

export const Route = createRootRoute({
  component: () => (
    <WebSocketProvider>
      <ChatProvider>
        <HeadContent />
        <Outlet />
        {showDevtools ? (
          <TanStackRouterDevtools position="bottom-right" />
        ) : null}
        {showDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </ChatProvider>
    </WebSocketProvider>
  ),
  notFoundComponent: () => <NotFound />,
  errorComponent: () => <ErrorComponent />,
})

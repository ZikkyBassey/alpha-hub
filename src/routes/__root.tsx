import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/clerk-react";

import appCss from "../styles.css?url";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs text-primary uppercase tracking-[0.3em] mb-4">Error 0x404</p>
        <h1 className="text-7xl font-black tracking-tighter text-foreground">SIGNAL LOST</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you're looking for has been liquidated or never existed.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-primary px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-primary-foreground hover:brightness-110"
          >
            Return to Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">System fault</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center bg-primary px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-primary-foreground"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CrypGuyKy — Real Alpha. Real Trades. Real PnL." },
      { name: "description", content: "Verified crypto trading signals, a transparent PnL leaderboard, and institutional-grade alpha from the CrypGuyKy desk." },
      { name: "author", content: "CrypGuyKy" },
      { property: "og:title", content: "CrypGuyKy — Real Alpha. Real Trades. Real PnL." },
      { property: "og:description", content: "Live trading calls, verified PnL leaderboard, and the desk's performance — fully transparent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster theme="dark" position="top-right" />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

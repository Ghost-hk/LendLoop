import type { Metadata } from "next"
import { Barlow, Barlow_Condensed } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ConvexClientProvider } from "@/components/providers/convex-client-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-barlow" })
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-condensed" })

export const metadata: Metadata = {
  title: { default: "LendLoop", template: "%s · LendLoop" },
  description: "Borrow what you need. Lend what you don't. A neighborhood tool-lending board.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(barlow.variable, barlowCondensed.variable)}>
      <body>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#1b1b1b",
              colorBackground: "#fbf9f4",
              colorForeground: "#1b1b1b",
              colorInput: "#ffffff",
              borderRadius: "0.5rem",
              fontFamily: "var(--font-barlow)",
            },
          }}
        >
          <ConvexClientProvider>
            <ThemeProvider>
              <TooltipProvider>
                {children}
                <Toaster position="bottom-right" />
              </TooltipProvider>
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

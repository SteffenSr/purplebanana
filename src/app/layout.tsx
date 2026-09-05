import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { TimerAlarmBanner } from "@/components/TimerAlarmBanner";

export const metadata: Metadata = {
  title: "Simmer",
  description: "Large-type vegan recipes for cooking in your kitchen, and your food system of record.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Recipes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6d28d9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        <TimerAlarmBanner />
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { TimerAlarmBanner } from "@/components/TimerAlarmBanner";

export const metadata: Metadata = {
  title: "Kitchen Recipes",
  description: "Large-type, offline-friendly vegan recipes for cooking in your kitchen.",
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
        <ServiceWorkerRegister />
        <TimerAlarmBanner />
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}

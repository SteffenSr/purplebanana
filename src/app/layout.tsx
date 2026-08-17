import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { OnlineStatus } from "@/components/OnlineStatus";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Kitchen Recipes",
  description: "Large-type, offline-friendly recipes for cooking in your kitchen.",
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
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        <header className="app-header">
          <div className="app-header__inner">
            <Link href="/" className="app-header__brand">
              <span className="app-header__brand-mark" aria-hidden>
                🍳
              </span>
              Kitchen Recipes
            </Link>
            <OnlineStatus />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

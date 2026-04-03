import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TradeJournal - EA/Bot Trading Journal",
  description:
    "Track, analyze, and optimize your EA/bot trading performance with a modern, professional trading journal.",
  keywords: ["trading journal", "EA trading", "bot trading", "forex", "XAUUSD"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

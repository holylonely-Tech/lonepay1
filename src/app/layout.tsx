import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LonePay — Nigerian VTU & Digital Bill Payments",
  description:
    "Fast, dependable VTU and utility payments across Nigeria. Recharge airtime, buy data bundles, pay electricity bills with instant token generation, and renew cable TV subscriptions with zero stress.",
  keywords: [
    "LonePay",
    "VTU Nigeria",
    "Buy Airtime",
    "Cheap Data Nigeria",
    "Electricity Token",
    "IKEDC",
    "EKEDC",
    "DStv subscription",
    "GOtv",
    "WAEC PIN",
  ],
  icons: {
    icon: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

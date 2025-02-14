import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { ViewTransitions } from "next-view-transitions";

export const metadata: Metadata = {
  title: "Pranith's Portfolio",
  description: "Pranith's Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body className={`antialiased`}>
          {children}
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}

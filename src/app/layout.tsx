import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { PostHogProvider } from "./providers";

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
          <PostHogProvider>{children}</PostHogProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}

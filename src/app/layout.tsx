import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { ViewTransitions } from "next-view-transitions";

const satoshi = localFont({
  src: [
    {
      path: "../../src/fonts/Satoshi-Variable.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../../src/fonts/Satoshi-VariableItalic.ttf",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
});

const faktum = localFont({
  src: "../../src/fonts/Faktum-Regular.otf",
  variable: "--font-faktum",
});

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
        <body className={`${satoshi.variable} ${faktum.variable} antialiased`}>
          <div className="max-w-md lg:max-w-2xl mx-auto mt-20">
            <Nav />
            {children}
            <Footer />
          </div>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}

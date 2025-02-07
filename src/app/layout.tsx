import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Variable.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-VariableItalic.ttf",
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
});

const faktum = localFont({
  src: "../../public/fonts/Faktum-Regular.otf",
  variable: "--font-faktum",
});

const gopher = localFont({
  src: "../../public/fonts/gopher/Gopher-Regular.ttf",
  variable: "--font-gopher",
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
    <html lang="en">
      <body className={`${satoshi.variable} ${faktum.variable} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

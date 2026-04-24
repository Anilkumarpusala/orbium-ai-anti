import type { Metadata, Viewport } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Orbium AI",
  description: "Next Generation AI Platform",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("RootLayout rendered");
  return (
    <html lang="en" style={{ backgroundColor: "#000000", color: "#FFFFFF", margin: 0, padding: 0, height: "100%" }}>
      <body
        className={`${syne.variable} ${jetBrainsMono.variable}`}
        style={{
          backgroundColor: "#000000",
          color: "#FFFFFF",
          margin: 0,
          padding: 0,
          minHeight: "100%",
          fontFamily: "var(--font-jetbrains), monospace",
        }}
      >
        {children}
      </body>
    </html>
  );
}

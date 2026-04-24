import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "DevTeam OS",
    description: "AI Dev Team platform that generates full production-ready Next.js projects.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} min-h-screen bg-black antialiased selection:bg-indigo-500/30`}>
                {children}
            </body>
        </html>
    );
}

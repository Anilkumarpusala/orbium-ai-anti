import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding - Orbium AI",
  description: "Set up your AI team",
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      {children}
    </div>
  );
}

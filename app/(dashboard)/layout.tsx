"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, supabase } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const layoutStyle = {
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "100vh",
    backgroundColor: "#000000",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    backgroundColor: "#0A0A0A",
    borderBottom: "1px solid #1A1A1A",
  };

  const mainStyle = {
    flex: 1,
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#000000" }}>
        <div style={{ color: "#FFFFFF", fontFamily: "var(--font-jetbrains)" }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div style={layoutStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Logo size={28} />
          <span style={{ fontFamily: "var(--font-syne)", fontWeight: "bold", fontSize: "18px", color: "#FFFFFF" }}>
            Orbium AI
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: "14px", color: "#888888" }}>
            {user.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>
      <main style={mainStyle}>
        {children}
      </main>
    </div>
  );
}

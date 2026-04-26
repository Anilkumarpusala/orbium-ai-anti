"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import { Logo } from "../../../components/ui/Logo";
import { createClient } from "../../../utils/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/workspace");
      router.refresh();
    }
  };

  const containerStyle = {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "#000000",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "400px",
  };

  const headerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    marginBottom: "32px",
  };

  const titleStyle = {
    fontFamily: "var(--font-syne)",
    fontSize: "24px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: "16px",
    marginBottom: "8px",
  };

  const subtitleStyle = {
    fontFamily: "var(--font-jetbrains)",
    fontSize: "14px",
    color: "#888888",
    textAlign: "center" as const,
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  };

  const linkStyle = {
    color: "#FFFFFF",
    textDecoration: "underline",
    cursor: "pointer",
    fontFamily: "var(--font-jetbrains)",
    fontSize: "14px",
  };

  return (
    <div style={containerStyle}>
      <Card style={cardStyle}>
        <div style={headerStyle}>
          <Logo size={48} />
          <h1 style={titleStyle}>Create an account</h1>
          <p style={subtitleStyle}>Get started with Orbium AI</p>
        </div>

        {error && (
          <div style={{ backgroundColor: "#ef444420", border: "1px solid #ef4444", color: "#ef4444", padding: "12px", borderRadius: "6px", marginBottom: "16px", fontSize: "14px", fontFamily: "var(--font-jetbrains)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={formStyle}>
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
          />
          <Button type="submit" isLoading={isLoading} style={{ width: "100%", marginTop: "8px" }}>
            Sign Up
          </Button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "#888888", fontFamily: "var(--font-jetbrains)" }}>
          Already have an account?{" "}
          <span style={linkStyle} onClick={() => router.push("/login")}>
            Log in
          </span>
        </div>
      </Card>
    </div>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const syne = "var(--font-syne), sans-serif";
  const mono = "var(--font-jetbrains), monospace";

  const agents = [
    { icon: "🔍", name: "Scout", color: "#06B6D4", desc: "Find qualified leads fast", detail: "Drop a niche and location. Scout returns 8–10 ready-to-contact leads with decision maker names." },
    { icon: "✉️", name: "Rex", color: "#F59E0B", desc: "Outreach that gets replies", detail: "Rex writes personalized cold emails and 2-step follow-up sequences. Never sounds templated." },
    { icon: "📣", name: "Aria", color: "#EC4899", desc: "Content that attracts customers", detail: "LinkedIn hooks, 30-day content calendars, and posts written in your voice." },
  ];

  const pricing = [
    { plan: "Free", price: "₹0", period: "/month", tasks: "10 tasks/month", features: ["All 3 agents", "10 tasks/month", "Export results"], cta: "Start Free", highlight: false },
    { plan: "Growth", price: "₹299", period: "/month", tasks: "Unlimited tasks", features: ["All 3 agents", "Unlimited tasks", "Priority responses", "Export CSV"], cta: "Get Growth", highlight: true },
    { plan: "Business", price: "₹999", period: "/month", tasks: "3 workspaces", features: ["3 team workspaces", "Unlimited tasks", "API access", "Priority support"], cta: "Get Business", highlight: false },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#FFF", fontFamily: mono }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid #111", position: "sticky", top: 0, backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #06B6D4, #EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: syne, fontWeight: 800, fontSize: "16px", color: "#000" }}>O</div>
          <span style={{ fontFamily: syne, fontWeight: 700, fontSize: "18px" }}>Orbium AI</span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => router.push("/login")} style={{ padding: "8px 18px", borderRadius: "6px", backgroundColor: "transparent", color: "#888", border: "1px solid #222", cursor: "pointer", fontFamily: mono, fontSize: "13px" }}>Log in</button>
          <button onClick={() => router.push("/signup")} style={{ padding: "8px 18px", borderRadius: "6px", backgroundColor: "#FFF", color: "#000", border: "none", cursor: "pointer", fontFamily: mono, fontSize: "13px", fontWeight: 600 }}>Start Free →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "100px 24px 80px", maxWidth: "800px", margin: "0 auto" }}>
        <div className="fade-up" style={{ display: "inline-block", padding: "4px 14px", borderRadius: "999px", border: "1px solid #1A1A1A", color: "#888", fontFamily: mono, fontSize: "12px", marginBottom: "32px" }}>
          AI agents for founders ⚡
        </div>
        <h1 className="fade-up" style={{ fontFamily: syne, fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 24px", background: "linear-gradient(135deg, #FFF 40%, #666)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Hire Agents.<br />Not People.
        </h1>
        <p className="fade-up" style={{ fontSize: "18px", color: "#666", lineHeight: 1.7, margin: "0 0 48px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
          Run your entire company with AI. Find leads, write outreach, create content — all in one workspace.
        </p>
        <div className="fade-up" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => router.push("/signup")} style={{ padding: "14px 32px", borderRadius: "8px", backgroundColor: "#FFF", color: "#000", border: "none", cursor: "pointer", fontFamily: syne, fontSize: "16px", fontWeight: 700 }}>Start Free →</button>
          <button onClick={() => router.push("/workspace")} style={{ padding: "14px 32px", borderRadius: "8px", backgroundColor: "transparent", color: "#FFF", border: "1px solid #333", cursor: "pointer", fontFamily: mono, fontSize: "14px" }}>See Demo →</button>
        </div>
      </section>

      {/* AGENTS */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px 100px" }}>
        <p style={{ textAlign: "center", fontFamily: mono, fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "48px" }}>Your AI team</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {agents.map(ag => (
            <div key={ag.name} style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "12px", padding: "28px", transition: "border-color 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = ag.color; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1A1A1A"; }}>
              <div style={{ fontSize: "28px", marginBottom: "16px" }}>{ag.icon}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontFamily: syne, fontSize: "20px", fontWeight: 700, color: ag.color }}>{ag.name}</span>
              </div>
              <p style={{ fontFamily: syne, fontSize: "15px", color: "#FFF", fontWeight: 600, margin: "0 0 10px" }}>{ag.desc}</p>
              <p style={{ fontFamily: mono, fontSize: "12px", color: "#555", margin: 0, lineHeight: 1.7 }}>{ag.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 100px" }}>
        <p style={{ textAlign: "center", fontFamily: mono, fontSize: "11px", color: "#444", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>Simple pricing</p>
        <h2 style={{ fontFamily: syne, fontSize: "36px", fontWeight: 700, textAlign: "center", margin: "0 0 48px" }}>Pay as you grow</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {pricing.map(p => (
            <div key={p.plan} style={{ backgroundColor: p.highlight ? "#0D0D0D" : "#080808", border: `1px solid ${p.highlight ? "#333" : "#1A1A1A"}`, borderRadius: "12px", padding: "28px", position: "relative" }}>
              {p.highlight && <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#FFF", color: "#000", fontFamily: mono, fontSize: "10px", fontWeight: 700, padding: "3px 12px", borderRadius: "0 0 8px 8px" }}>POPULAR</div>}
              <p style={{ fontFamily: syne, fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>{p.plan}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "6px" }}>
                <span style={{ fontFamily: syne, fontSize: "32px", fontWeight: 800 }}>{p.price}</span>
                <span style={{ color: "#555", fontSize: "13px" }}>{p.period}</span>
              </div>
              <p style={{ fontFamily: mono, fontSize: "12px", color: "#888", margin: "0 0 24px" }}>{p.tasks}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontFamily: mono, fontSize: "12px", color: "#888", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#22C55E" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push("/signup")} style={{ width: "100%", padding: "12px", borderRadius: "6px", backgroundColor: p.highlight ? "#FFF" : "transparent", color: p.highlight ? "#000" : "#FFF", border: p.highlight ? "none" : "1px solid #333", cursor: "pointer", fontFamily: mono, fontSize: "13px", fontWeight: p.highlight ? 700 : 400 }}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #111", padding: "32px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ fontFamily: syne, fontWeight: 700, fontSize: "15px" }}>Orbium AI</span>
        <span style={{ fontFamily: mono, fontSize: "12px", color: "#444" }}>© 2025 Orbium AI. All rights reserved.</span>
        <div style={{ display: "flex", gap: "20px" }}>
          <button onClick={() => router.push("/login")} style={{ background: "none", border: "none", color: "#555", fontFamily: mono, fontSize: "12px", cursor: "pointer" }}>Log in</button>
          <button onClick={() => router.push("/signup")} style={{ background: "none", border: "none", color: "#555", fontFamily: mono, fontSize: "12px", cursor: "pointer" }}>Sign up</button>
        </div>
      </footer>
    </div>
  );
}

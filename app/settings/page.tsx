"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const PROVIDERS = ["openrouter", "gemini", "openai", "groq", "claude"];
const PROVIDER_LABELS: Record<string, string> = {
  openrouter: "OpenRouter",
  gemini: "Gemini (Free ✨)",
  openai: "OpenAI",
  groq: "Groq",
  claude: "Claude",
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [provider, setProvider] = useState("openrouter");
  const [apiKey, setApiKey] = useState("");
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const mono = "var(--font-jetbrains), monospace";
  const syne = "var(--font-syne), sans-serif";

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserEmail(session.user.email ?? "");
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("api_provider, api_key_hint")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        const p = (profile.api_provider ?? "").toLowerCase().trim();
        setCurrentProvider(p || null);
        setCurrentHint(profile.api_key_hint ?? null);
        if (p) setProvider(p);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "Please enter an API key." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const encoded = btoa(apiKey.trim());
      const hint = apiKey.trim().slice(-4);

      const { error } = await supabase.from("user_profiles").upsert(
        {
          user_id: userId,
          api_provider: provider,
          encrypted_api_key: encoded,
          api_key_hint: hint,
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;
      setCurrentProvider(provider);
      setCurrentHint(hint);
      setApiKey("");
      setMessage({ type: "success", text: "API key saved successfully!" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!userId) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/agents/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "Say hello as Scout agent in one sentence.",
          userId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "NO_API_KEY") {
          setTestResult({ type: "error", text: "No API key saved yet. Save your key first." });
        } else if (json.error === "LIMIT_REACHED") {
          setTestResult({ type: "error", text: "Task limit reached. Upgrade for more." });
        } else {
          setTestResult({ type: "error", text: json.error || "Connection failed" });
        }
      } else {
        setTestResult({ type: "success", text: "Connected ✓  " + (json.output?.slice(0, 80) ?? "") });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setTestResult({ type: "error", text: msg });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#000", color: "#FFF",
      fontFamily: mono, display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "16px 24px", borderBottom: "1px solid #1A1A1A",
        backgroundColor: "#080808",
      }}>
        <button
          onClick={() => router.push("/workspace")}
          style={{ background: "none", border: "none", color: "#888", fontFamily: mono, fontSize: "13px", cursor: "pointer", padding: 0 }}
        >← Back to Workspace</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "12px", color: "#444" }}>{userEmail}</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: "560px", margin: "48px auto", padding: "0 24px", width: "100%", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: syne, fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>Settings</h1>
        <p style={{ color: "#555", margin: "0 0 40px", fontSize: "14px" }}>Manage your API keys and account.</p>

        {/* API Keys */}
        <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: syne, fontSize: "18px", fontWeight: 600, margin: "0 0 6px" }}>API Keys</h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 24px", lineHeight: 1.6 }}>
            Orbium uses your own API key. Encrypted and stored securely. Never shared.
          </p>

          {/* Current key status */}
          {currentProvider && currentHint && (
            <div style={{
              backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", borderRadius: "6px",
              padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
              <div>
                <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>Active key</p>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#FFF" }}>
                  {PROVIDER_LABELS[currentProvider] ?? currentProvider} — <span style={{ color: "#555" }}>****{currentHint}</span>
                </p>
              </div>
            </div>
          )}

          {/* Provider dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>Provider</label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              style={{
                backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF",
                padding: "12px 14px", fontFamily: mono, fontSize: "13px",
                borderRadius: "6px", outline: "none", appearance: "none", cursor: "pointer",
              }}
            >
              {PROVIDERS.map(p => (
                <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {/* API Key input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>
              API Key{currentHint ? " (leave blank to keep current)" : ""}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={currentHint ? `Current: ****${currentHint}` : "Paste your API key here"}
              style={{
                backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF",
                padding: "12px 14px", fontFamily: mono, fontSize: "13px",
                borderRadius: "6px", outline: "none", width: "100%", boxSizing: "border-box",
              }}
            />
          </div>
          <p style={{ fontSize: "11px", color: "#444", margin: "0 0 20px" }}>
            🔒 Base64-encoded before storing. Never logged or sent anywhere else.
          </p>

          {message && (
            <div style={{
              padding: "10px 14px", borderRadius: "6px", marginBottom: "16px",
              backgroundColor: message.type === "success" ? "#002A12" : "#1A0000",
              border: `1px solid ${message.type === "success" ? "#22C55E" : "#EF4444"}`,
              color: message.type === "success" ? "#22C55E" : "#EF4444",
              fontSize: "13px",
            }}>{message.text}</div>
          )}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "12px 24px", borderRadius: "6px",
                backgroundColor: saving ? "#1A1A1A" : "#FFF",
                color: saving ? "#555" : "#000",
                border: "none", cursor: saving ? "not-allowed" : "pointer",
                fontFamily: mono, fontSize: "13px", fontWeight: 600,
              }}
            >{saving ? "Saving…" : "Save API Key"}</button>

            <button
              onClick={handleTest}
              disabled={testing}
              style={{
                padding: "12px 24px", borderRadius: "6px",
                backgroundColor: "transparent",
                color: testing ? "#555" : "#888",
                border: "1px solid #333", cursor: testing ? "not-allowed" : "pointer",
                fontFamily: mono, fontSize: "13px",
              }}
            >{testing ? "Testing…" : "Test Connection"}</button>
          </div>

          {testResult && (
            <div style={{
              marginTop: "16px", padding: "10px 14px", borderRadius: "6px",
              backgroundColor: testResult.type === "success" ? "#002A12" : "#1A0000",
              border: `1px solid ${testResult.type === "success" ? "#22C55E" : "#EF4444"}`,
              color: testResult.type === "success" ? "#22C55E" : "#EF4444",
              fontSize: "12px", lineHeight: 1.6,
            }}>{testResult.text}</div>
          )}
        </div>

        {/* Account */}
        <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontFamily: syne, fontSize: "18px", fontWeight: 600, margin: "0 0 6px" }}>Account</h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 16px" }}>{userEmail}</p>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
            style={{
              padding: "10px 20px", borderRadius: "6px",
              backgroundColor: "transparent", color: "#EF4444",
              border: "1px solid #3A0000", cursor: "pointer",
              fontFamily: mono, fontSize: "13px",
            }}
          >Sign out</button>
        </div>
      </div>
    </div>
  );
}

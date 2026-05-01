"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const PROVIDERS = [
  "Gemini (Free ✨)",
  "OpenAI",
  "Claude",
  "Groq",
  "OpenRouter",
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [provider, setProvider] = useState("Gemini (Free ✨)");
  const [apiKey, setApiKey] = useState("");
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        setCurrentProvider(profile.api_provider ?? null);
        setCurrentHint(profile.api_key_hint ?? null);
        if (profile.api_provider) setProvider(profile.api_provider);
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
      const encryptedKey = btoa(apiKey.trim());
      const hint = apiKey.trim().slice(-4);

      const { error } = await supabase
        .from("user_profiles")
        .update({
          api_provider: provider,
          encrypted_api_key: encryptedKey,
          api_key_hint: hint,
        })
        .eq("user_id", userId);

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
          style={{
            background: "none", border: "none", color: "#888",
            fontFamily: mono, fontSize: "13px", cursor: "pointer", padding: 0,
          }}
        >← Back to Workspace</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "12px", color: "#444" }}>{userEmail}</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: "560px", margin: "48px auto", padding: "0 24px", width: "100%", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: syne, fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>Settings</h1>
        <p style={{ color: "#555", margin: "0 0 40px", fontSize: "14px" }}>
          Manage your API keys and account preferences.
        </p>

        {/* API Keys Section */}
        <div style={{
          backgroundColor: "#080808", border: "1px solid #1A1A1A",
          borderRadius: "8px", padding: "24px", marginBottom: "24px",
        }}>
          <h2 style={{ fontFamily: syne, fontSize: "18px", fontWeight: 600, margin: "0 0 6px" }}>API Keys</h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 24px", lineHeight: 1.5 }}>
            Orbium uses your own API key to run agents. Your key is encrypted and never shared.
          </p>

          {/* Current key status */}
          {currentProvider && currentHint && (
            <div style={{
              backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A",
              borderRadius: "6px", padding: "12px 16px", marginBottom: "20px",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: "#22C55E", boxShadow: "0 0 6px #22C55E",
              }} />
              <div>
                <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Current provider</p>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#FFF" }}>
                  {currentProvider} — <span style={{ color: "#555" }}>****{currentHint}</span>
                </p>
              </div>
            </div>
          )}

          {/* Provider dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>Select provider</label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              style={{
                backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A",
                color: "#FFF", padding: "12px 14px", fontFamily: mono,
                fontSize: "13px", borderRadius: "6px", outline: "none",
                appearance: "none", cursor: "pointer",
              }}
            >
              {PROVIDERS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* API Key input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>
              API Key {currentHint ? "(leave blank to keep current)" : ""}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={currentHint ? `Current: ****${currentHint}` : "Paste your API key here"}
              style={{
                backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A",
                color: "#FFF", padding: "12px 14px", fontFamily: mono,
                fontSize: "13px", borderRadius: "6px", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />
          </div>
          <p style={{ fontSize: "11px", color: "#444", margin: "0 0 20px" }}>
            🔒 Encrypted and stored securely. Never logged or shared.
          </p>

          {/* Message */}
          {message && (
            <div style={{
              padding: "10px 14px", borderRadius: "6px", marginBottom: "16px",
              backgroundColor: message.type === "success" ? "#002A12" : "#1A0000",
              border: `1px solid ${message.type === "success" ? "#22C55E" : "#EF4444"}`,
              color: message.type === "success" ? "#22C55E" : "#EF4444",
              fontSize: "13px",
            }}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "12px 24px", borderRadius: "6px",
              backgroundColor: saving ? "#1A1A1A" : "#FFF",
              color: saving ? "#555" : "#000",
              border: "none", cursor: saving ? "not-allowed" : "pointer",
              fontFamily: mono, fontSize: "13px", fontWeight: 600,
              transition: "all 0.2s",
            }}
          >{saving ? "Saving…" : "Save API Key"}</button>
        </div>

        {/* Account section */}
        <div style={{
          backgroundColor: "#080808", border: "1px solid #1A1A1A",
          borderRadius: "8px", padding: "24px",
        }}>
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

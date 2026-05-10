"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const PROVIDERS = [
  { value: "openrouter", label: "OpenRouter" },
  { value: "gemini",     label: "Gemini (Free ✨)" },
  { value: "openai",     label: "OpenAI" },
  { value: "groq",       label: "Groq" },
  { value: "claude",     label: "Claude" },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail]       = useState("");
  const [userId, setUserId]             = useState("");
  const [provider, setProvider]         = useState("openrouter");
  const [apiKey, setApiKey]             = useState("");
  const [currentHint, setCurrentHint]   = useState<string | null>(null);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);
  const [removing, setRemoving]         = useState(false);
  const [testing, setTesting]           = useState(false);
  const [saveMsg, setSaveMsg]           = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testResult, setTestResult]     = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  // ── Save key ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!apiKey.trim()) {
      setSaveMsg({ type: "error", text: "Please enter an API key." });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const encoded = btoa(apiKey.trim());
      const hint    = apiKey.trim().slice(-4);

      // Use UPDATE — profile always exists after onboarding.
      // Falls back to INSERT if for some reason it doesn't exist.
      const { error: updateErr, count } = await supabase
        .from("user_profiles")
        .update({ api_provider: provider, encrypted_api_key: encoded, api_key_hint: hint })
        .eq("user_id", userId)
        .select("user_id", { count: "exact", head: true });

      if (updateErr) throw updateErr;

      // If no rows were updated (profile missing), do an insert
      if (count === 0) {
        const { error: insertErr } = await supabase
          .from("user_profiles")
          .insert({ user_id: userId, api_provider: provider, encrypted_api_key: encoded, api_key_hint: hint });
        if (insertErr) throw insertErr;
      }

      setCurrentProvider(provider);
      setCurrentHint(hint);
      setApiKey("");
      setSaveMsg({ type: "success", text: "API key saved! Click \"Test Connection\" to verify it works." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      setSaveMsg({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // ── Remove key ──────────────────────────────────────────────────────────────
  const handleRemove = async () => {
    if (!confirm("Remove your API key? You won't be able to run tasks until you add a new one.")) return;
    setRemoving(true);
    setSaveMsg(null);
    setTestResult(null);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ api_provider: null, encrypted_api_key: null, api_key_hint: null })
        .eq("user_id", userId);
      if (error) throw error;
      setCurrentProvider(null);
      setCurrentHint(null);
      setApiKey("");
      setSaveMsg({ type: "success", text: "API key removed successfully." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to remove key";
      setSaveMsg({ type: "error", text: msg });
    } finally {
      setRemoving(false);
    }
  };

  // ── Test connection ─────────────────────────────────────────────────────────
  const handleTest = async () => {
    if (!userId) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res  = await fetch("/api/agents/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "Say hello as Scout agent in one sentence.", userId }),
      });
      const json = await res.json();
      if (!res.ok) {
        const errMap: Record<string, string> = {
          NO_API_KEY:    "No API key saved. Save your key first.",
          LIMIT_REACHED: "Task limit reached. Upgrade for more.",
        };
        setTestResult({ type: "error", text: errMap[json.error] ?? (json.error || "Connection failed") });
      } else {
        setTestResult({ type: "success", text: "Connected ✓   " + (json.output?.slice(0, 100) ?? "") });
      }
    } catch (err) {
      setTestResult({ type: "error", text: err instanceof Error ? err.message : "Connection failed" });
    } finally {
      setTesting(false);
    }
  };

  const providerLabel = PROVIDERS.find(p => p.value === currentProvider)?.label ?? currentProvider;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#FFF", fontFamily: mono, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1A1A1A", backgroundColor: "#080808" }}>
        <button onClick={() => router.push("/workspace")} style={{ background: "none", border: "none", color: "#888", fontFamily: mono, fontSize: "13px", cursor: "pointer", padding: 0 }}>← Back to Workspace</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "12px", color: "#444" }}>{userEmail}</span>
      </div>

      <div style={{ flex: 1, maxWidth: "560px", margin: "48px auto", padding: "0 24px", width: "100%", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: syne, fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>Settings</h1>
        <p style={{ color: "#555", margin: "0 0 40px", fontSize: "14px" }}>Manage your API keys and account.</p>

        {/* API Keys card */}
        <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: syne, fontSize: "18px", fontWeight: 600, margin: "0 0 6px" }}>API Keys</h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 24px", lineHeight: 1.6 }}>
            Orbium uses your own API key. Encrypted before storing. Never shared.
          </p>

          {/* Active key status */}
          {currentProvider && currentHint ? (
            <div style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", borderRadius: "6px", padding: "14px 16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22C55E", boxShadow: "0 0 6px #22C55E", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>Active key</p>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#FFF" }}>
                      {providerLabel} — <span style={{ color: "#555" }}>****{currentHint}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  style={{ padding: "6px 12px", borderRadius: "4px", backgroundColor: "transparent", color: removing ? "#555" : "#EF4444", border: "1px solid #3A0000", cursor: removing ? "not-allowed" : "pointer", fontFamily: mono, fontSize: "11px" }}
                >{removing ? "Removing…" : "Remove Key"}</button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: "#0A0A0A", border: "1px solid #2A0000", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444", flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: "13px", color: "#EF4444" }}>No API key set. Add one below to run tasks.</p>
            </div>
          )}

          {/* Provider selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>Provider</label>
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF", padding: "12px 14px", fontFamily: mono, fontSize: "13px", borderRadius: "6px", outline: "none", appearance: "none", cursor: "pointer" }}
            >
              {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
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
              onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
              placeholder={currentHint ? `Current: ****${currentHint}` : "Paste your API key here"}
              style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF", padding: "12px 14px", fontFamily: mono, fontSize: "13px", borderRadius: "6px", outline: "none", width: "100%", boxSizing: "border-box" }}
            />
          </div>
          <p style={{ fontSize: "11px", color: "#444", margin: "0 0 20px" }}>
            🔒 Base64-encoded before storing. Never logged or sent elsewhere.
          </p>

          {/* Save feedback */}
          {saveMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "6px", marginBottom: "16px", backgroundColor: saveMsg.type === "success" ? "#002A12" : "#1A0000", border: `1px solid ${saveMsg.type === "success" ? "#22C55E" : "#EF4444"}`, color: saveMsg.type === "success" ? "#22C55E" : "#EF4444", fontSize: "13px" }}>
              {saveMsg.text}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleSave}
              disabled={saving || !apiKey.trim()}
              style={{ padding: "12px 24px", borderRadius: "6px", backgroundColor: (saving || !apiKey.trim()) ? "#1A1A1A" : "#FFF", color: (saving || !apiKey.trim()) ? "#555" : "#000", border: "none", cursor: (saving || !apiKey.trim()) ? "not-allowed" : "pointer", fontFamily: mono, fontSize: "13px", fontWeight: 600, transition: "all 0.2s" }}
            >{saving ? "Saving…" : "Save API Key"}</button>

            <button
              onClick={handleTest}
              disabled={testing || (!currentHint && !apiKey.trim())}
              style={{ padding: "12px 24px", borderRadius: "6px", backgroundColor: "transparent", color: testing ? "#555" : "#888", border: "1px solid #333", cursor: testing ? "not-allowed" : "pointer", fontFamily: mono, fontSize: "13px", transition: "all 0.2s" }}
            >{testing ? "Testing…" : "Test Connection"}</button>
          </div>

          {/* Test result */}
          {testResult && (
            <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "6px", backgroundColor: testResult.type === "success" ? "#002A12" : "#1A0000", border: `1px solid ${testResult.type === "success" ? "#22C55E" : "#EF4444"}`, color: testResult.type === "success" ? "#22C55E" : "#EF4444", fontSize: "12px", lineHeight: 1.7 }}>
              {testResult.text}
            </div>
          )}
        </div>

        {/* Account card */}
        <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontFamily: syne, fontSize: "18px", fontWeight: 600, margin: "0 0 6px" }}>Account</h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 16px" }}>{userEmail}</p>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
            style={{ padding: "10px 20px", borderRadius: "6px", backgroundColor: "transparent", color: "#EF4444", border: "1px solid #3A0000", cursor: "pointer", fontFamily: mono, fontSize: "13px" }}
          >Sign out</button>
        </div>
      </div>
    </div>
  );
}

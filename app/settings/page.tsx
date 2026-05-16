"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// ─── Provider definitions ──────────────────────────────────────────────────────
const PROVIDERS = [
  { value: "gemini",  label: "Google Gemini",    icon: "🌐", color: "#4285F4" },
  { value: "claude",  label: "Anthropic Claude",  icon: "🔮", color: "#D4A853" },
  { value: "openai",  label: "OpenAI ChatGPT",    icon: "🤖", color: "#10A37F" },
  { value: "meta",    label: "Meta AI (Ollama)",  icon: "🦙", color: "#0668E1" },
];

// ─── Model catalogues ──────────────────────────────────────────────────────────
const MODELS: Record<string, { value: string; label: string }[]> = {
  gemini: [
    { value: "gemini-2.5-flash-preview-04-17", label: "Gemini 2.5 Flash Preview (Latest)" },
    { value: "gemini-2.5-pro-preview-05-06",   label: "Gemini 2.5 Pro Preview" },
    { value: "gemini-2.0-flash",               label: "Gemini 2.0 Flash" },
    { value: "gemini-2.0-flash-lite",          label: "Gemini 2.0 Flash Lite" },
    { value: "gemini-1.5-flash",               label: "Gemini 1.5 Flash" },
    { value: "gemini-1.5-flash-8b",            label: "Gemini 1.5 Flash 8B" },
    { value: "gemini-1.5-pro",                 label: "Gemini 1.5 Pro" },
  ],
  claude: [
    { value: "claude-opus-4-5",              label: "Claude Opus 4.5 (Latest)" },
    { value: "claude-3-7-sonnet-20250219",   label: "Claude 3.7 Sonnet" },
    { value: "claude-3-5-sonnet-20241022",   label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-20241022",    label: "Claude 3.5 Haiku" },
    { value: "claude-3-opus-20240229",       label: "Claude 3 Opus" },
    { value: "claude-3-sonnet-20240229",     label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku-20240307",      label: "Claude 3 Haiku" },
  ],
  openai: [
    { value: "o4-mini",       label: "o4 Mini (Latest)" },
    { value: "o3-mini",       label: "o3 Mini" },
    { value: "o1",            label: "o1" },
    { value: "o1-mini",       label: "o1 Mini" },
    { value: "gpt-4o",        label: "GPT-4o" },
    { value: "gpt-4o-mini",   label: "GPT-4o Mini" },
    { value: "gpt-4-turbo",   label: "GPT-4 Turbo" },
    { value: "gpt-4",         label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  meta: [
    { value: "llama3.3:latest",   label: "Llama 3.3 70B (Recommended)" },
    { value: "llama3.2:latest",   label: "Llama 3.2 (3B)" },
    { value: "llama3.1:latest",   label: "Llama 3.1 8B" },
    { value: "llama3:latest",     label: "Llama 3 8B" },
    { value: "llama2:latest",     label: "Llama 2 7B" },
    { value: "codellama:latest",  label: "Code Llama" },
    { value: "custom",            label: "Custom model (enter below)" },
  ],
};

const DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-2.0-flash",
  claude: "claude-3-5-haiku-20241022",
  openai: "gpt-4o-mini",
  meta:   "llama3.3:latest",
};

export default function SettingsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const supabase     = createClient();

  const [userEmail, setUserEmail]       = useState("");
  const [userId, setUserId]             = useState("");
  const [provider, setProvider]         = useState("gemini");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS.gemini);
  const [customModel, setCustomModel]   = useState("");
  const [apiKey, setApiKey]             = useState("");
  const [ollamaUrl, setOllamaUrl]       = useState("http://localhost:11434");
  const [currentHint, setCurrentHint]   = useState<string | null>(null);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);
  const [removing, setRemoving]         = useState(false);
  const [testing, setTesting]           = useState(false);
  const [saveMsg, setSaveMsg]           = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testResult, setTestResult]     = useState<{ type: "success" | "error"; text: string } | null>(null);

  const mono = "var(--font-jetbrains), monospace";
  const syne = "var(--font-syne), sans-serif";

  // When provider changes, reset model to default for that provider
  const handleProviderChange = (p: string) => {
    setProvider(p);
    setSelectedModel(DEFAULT_MODELS[p] ?? MODELS[p]?.[0]?.value ?? "");
    setSaveMsg(null);
    setTestResult(null);
  };

  useEffect(() => {
    // Handle URL params from OAuth redirects or other flows
    const msg = searchParams.get("msg");
    if (msg === "saved") setSaveMsg({ type: "success", text: "Settings saved successfully." });

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserEmail(session.user.email ?? "");
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("api_provider, api_key_hint, selected_model, ollama_base_url")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        const p = (profile.api_provider ?? "gemini").toLowerCase().trim();
        setCurrentProvider(p);
        setCurrentHint(profile.api_key_hint ?? null);
        const m = profile.selected_model ?? DEFAULT_MODELS[p] ?? "";
        setCurrentModel(m);
        setSelectedModel(m);
        setProvider(p);
        if (profile.ollama_base_url) setOllamaUrl(profile.ollama_base_url);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveModel = selectedModel === "custom" ? customModel.trim() : selectedModel;

  const handleSave = async () => {
    const isMetaNoKey = provider === "meta"; // Meta/Ollama can work without an API key
    if (!isMetaNoKey && !apiKey.trim() && !currentHint) {
      setSaveMsg({ type: "error", text: "Please enter an API key." });
      return;
    }
    if (provider === "meta" && selectedModel === "custom" && !customModel.trim()) {
      setSaveMsg({ type: "error", text: "Please enter your custom Ollama model name." });
      return;
    }
    setSaving(true); setSaveMsg(null);
    try {
      const patch: Record<string, string | null> = {
        api_provider:   provider,
        selected_model: effectiveModel,
        ollama_base_url: ollamaUrl.trim() || "http://localhost:11434",
      };
      if (apiKey.trim()) {
        patch.encrypted_api_key = btoa(apiKey.trim());
        patch.api_key_hint      = apiKey.trim().slice(-4);
      }

      const { error } = await supabase
        .from("user_profiles")
        .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });
      if (error) throw error;

      setCurrentProvider(provider);
      if (apiKey.trim()) setCurrentHint(apiKey.trim().slice(-4));
      setCurrentModel(effectiveModel);
      setApiKey("");
      setSaveMsg({ type: "success", text: "Saved! Click \"Test Connection\" to verify." });
    } catch (err) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save" });
    } finally { setSaving(false); }
  };

  const handleRemove = async () => {
    if (!confirm("Remove your API key? You won't be able to run tasks until you add a new one.")) return;
    setRemoving(true); setSaveMsg(null); setTestResult(null);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ api_provider: null, encrypted_api_key: null, api_key_hint: null })
        .eq("user_id", userId);
      if (error) throw error;
      setCurrentProvider(null); setCurrentHint(null); setApiKey("");
      setSaveMsg({ type: "success", text: "API key removed." });
    } catch (err) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to remove" });
    } finally { setRemoving(false); }
  };

  const handleTest = async () => {
    if (!userId) return;
    setTesting(true); setTestResult(null);
    try {
      const res  = await fetch("/api/agents/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "Say hello as Scout agent in one sentence.", userId }),
      });
      const json = await res.json();
      if (!res.ok) {
        const errMap: Record<string, string> = {
          NO_API_KEY:    "No API key saved. Save your settings first.",
          LIMIT_REACHED: "Task limit reached.",
        };
        setTestResult({ type: "error", text: errMap[json.error] ?? json.error ?? "Connection failed" });
      } else {
        setTestResult({ type: "success", text: "✓ Connected!   " + (json.output?.slice(0, 120) ?? "") });
      }
    } catch (err) {
      setTestResult({ type: "error", text: err instanceof Error ? err.message : "Connection failed" });
    } finally { setTesting(false); }
  };

  const currentProviderLabel = PROVIDERS.find(p => p.value === currentProvider)?.label ?? currentProvider;
  const currentModelLabel    = MODELS[currentProvider ?? ""]?.find(m => m.value === currentModel)?.label ?? currentModel;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#FFF", fontFamily: mono, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1A1A1A", backgroundColor: "#080808" }}>
        <button onClick={() => router.push("/workspace")} style={{ background: "none", border: "none", color: "#888", fontFamily: mono, fontSize: "13px", cursor: "pointer", padding: 0 }}>← Back to Workspace</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "12px", color: "#444" }}>{userEmail}</span>
      </div>

      <div style={{ flex: 1, maxWidth: "640px", margin: "48px auto", padding: "0 24px", width: "100%", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: syne, fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>Settings</h1>
        <p style={{ color: "#555", margin: "0 0 32px", fontSize: "14px" }}>Choose your AI provider and model.</p>

        {/* ── Active key status ─────────────────────────────────────────────── */}
        {currentProvider && (currentHint || currentProvider === "meta") ? (
          <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
              <div>
                <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>Active configuration</p>
                <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#FFF" }}>
                  {currentProviderLabel}
                  {currentHint && <span style={{ color: "#555" }}> — ****{currentHint}</span>}
                  {currentModelLabel && <span style={{ color: "#888" }}> · {currentModelLabel}</span>}
                </p>
              </div>
            </div>
            <button onClick={handleRemove} disabled={removing} style={{ padding: "6px 12px", borderRadius: "4px", backgroundColor: "transparent", color: removing ? "#555" : "#EF4444", border: "1px solid #3A0000", cursor: removing ? "not-allowed" : "pointer", fontFamily: mono, fontSize: "11px" }}>{removing ? "Removing…" : "Remove Key"}</button>
          </div>
        ) : (
          <div style={{ backgroundColor: "#0A0A0A", border: "1px solid #2A0000", borderRadius: "8px", padding: "14px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444" }} />
            <p style={{ margin: 0, fontSize: "13px", color: "#EF4444" }}>No AI configured — set up a provider below to run tasks.</p>
          </div>
        )}

        {/* ── Provider tabs ─────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: syne, fontSize: "16px", fontWeight: 600, margin: "0 0 16px", color: "#888" }}>Select Provider</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {PROVIDERS.map(p => (
              <button
                key={p.value}
                onClick={() => handleProviderChange(p.value)}
                style={{
                  padding: "14px 16px", borderRadius: "8px", border: `1px solid ${provider === p.value ? p.color : "#1A1A1A"}`,
                  backgroundColor: provider === p.value ? `${p.color}15` : "#0A0A0A",
                  color: provider === p.value ? "#FFF" : "#666",
                  cursor: "pointer", fontFamily: mono, fontSize: "13px", fontWeight: provider === p.value ? 600 : 400,
                  display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "18px" }}>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* ── Model selector ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Model</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF", padding: "12px 14px", fontFamily: mono, fontSize: "13px", borderRadius: "6px", outline: "none", appearance: "none", cursor: "pointer", width: "100%" }}
            >
              {(MODELS[provider] ?? []).map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Custom model name for Ollama */}
          {provider === "meta" && selectedModel === "custom" && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Custom model name</label>
              <input
                value={customModel}
                onChange={e => setCustomModel(e.target.value)}
                placeholder="e.g. deepseek-r1:7b or phi4:latest"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF", padding: "12px 14px", fontFamily: mono, fontSize: "13px", borderRadius: "6px", outline: "none", width: "100%", boxSizing: "border-box" }}
              />
            </div>
          )}

          {/* ── Ollama URL (Meta only) ─────────────────────────────────────── */}
          {provider === "meta" && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Ollama Base URL</label>
              <input
                value={ollamaUrl}
                onChange={e => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF", padding: "12px 14px", fontFamily: mono, fontSize: "13px", borderRadius: "6px", outline: "none", width: "100%", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: "11px", color: "#444", margin: "6px 0 0", lineHeight: 1.6 }}>
                🦙 Run <code style={{ color: "#888", backgroundColor: "#111", padding: "1px 4px", borderRadius: "3px" }}>ollama serve</code> locally, or provide a public URL (ngrok / Cloudflare tunnel).
                API key is optional for local Ollama.
              </p>
            </div>
          )}

          {/* ── API Key (not shown for local Ollama) ──────────────────────── */}
          {provider !== "meta" && (
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>
                API Key{currentHint && currentProvider === provider ? " (leave blank to keep current)" : ""}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSave(); }}
                placeholder={currentHint && currentProvider === provider ? `Current key: ****${currentHint}` : "Paste your API key here"}
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF", padding: "12px 14px", fontFamily: mono, fontSize: "13px", borderRadius: "6px", outline: "none", width: "100%", boxSizing: "border-box" }}
              />
              <p style={{ fontSize: "11px", color: "#444", margin: "6px 0 0" }}>🔒 Base64-encoded before storing. Never logged or sent elsewhere.</p>
            </div>
          )}

          {/* ── API Key links ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: "20px", marginTop: "8px" }}>
            {provider === "gemini"  && <a href="https://aistudio.google.com/app/apikey"        target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#4285F4", textDecoration: "none" }}>Get Gemini API key at Google AI Studio →</a>}
            {provider === "claude"  && <a href="https://console.anthropic.com/settings/keys"   target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#D4A853", textDecoration: "none" }}>Get Claude API key at Anthropic Console →</a>}
            {provider === "openai"  && <a href="https://platform.openai.com/api-keys"          target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#10A37F", textDecoration: "none" }}>Get OpenAI API key at platform.openai.com →</a>}
            {provider === "meta"    && <a href="https://ollama.com/download"                    target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#0668E1", textDecoration: "none" }}>Download Ollama for local Meta AI →</a>}
          </div>

          {/* ── Save message ───────────────────────────────────────────────── */}
          {saveMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "6px", marginBottom: "16px", backgroundColor: saveMsg.type === "success" ? "#002A12" : "#1A0000", border: `1px solid ${saveMsg.type === "success" ? "#22C55E" : "#EF4444"}`, color: saveMsg.type === "success" ? "#22C55E" : "#EF4444", fontSize: "13px" }}>{saveMsg.text}</div>
          )}

          {/* ── Action buttons ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "12px 28px", borderRadius: "6px", backgroundColor: saving ? "#1A1A1A" : "#FFF", color: saving ? "#555" : "#000", border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: mono, fontSize: "13px", fontWeight: 600 }}
            >{saving ? "Saving…" : "Save Settings"}</button>
            <button
              onClick={handleTest}
              disabled={testing || (!currentHint && currentProvider !== "meta")}
              style={{ padding: "12px 24px", borderRadius: "6px", backgroundColor: "transparent", color: (testing || (!currentHint && currentProvider !== "meta")) ? "#555" : "#888", border: "1px solid #333", cursor: "pointer", fontFamily: mono, fontSize: "13px" }}
            >{testing ? "Testing…" : "Test Connection"}</button>
          </div>

          {/* ── Test result ────────────────────────────────────────────────── */}
          {testResult && (
            <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "6px", backgroundColor: testResult.type === "success" ? "#002A12" : "#1A0000", border: `1px solid ${testResult.type === "success" ? "#22C55E" : "#EF4444"}`, color: testResult.type === "success" ? "#22C55E" : "#EF4444", fontSize: "12px", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{testResult.text}</div>
          )}
        </div>

        {/* ── Account card ──────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontFamily: syne, fontSize: "16px", fontWeight: 600, margin: "0 0 6px" }}>Account</h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 16px" }}>{userEmail}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} style={{ padding: "10px 20px", borderRadius: "6px", backgroundColor: "transparent", color: "#EF4444", border: "1px solid #3A0000", cursor: "pointer", fontFamily: mono, fontSize: "13px" }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

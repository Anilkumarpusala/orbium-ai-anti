"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// ─── Provider list ─────────────────────────────────────────────────────────────
const PROVIDERS = [
  { value: "openrouter", label: "OpenRouter (recommended)" },
  { value: "gemini",     label: "Google Gemini" },
  { value: "openai",     label: "OpenAI" },
  { value: "groq",       label: "Groq" },
  { value: "claude",     label: "Anthropic Claude" },
];

// ─── OpenRouter model catalogue (free + paid, 40+ models) ─────────────────────
// Source: openrouter.ai/models  (updated May 2025)
const OR_MODELS = [
  // ── Free tier (:free suffix = no credits needed) ─────────────────────────
  { group: "🆓 Free Models",           value: "meta-llama/llama-3.3-70b-instruct:free",     label: "Llama 3.3 70B Instruct (free)" },
  { group: "🆓 Free Models",           value: "meta-llama/llama-3.1-8b-instruct:free",      label: "Llama 3.1 8B Instruct (free)" },
  { group: "🆓 Free Models",           value: "meta-llama/llama-3.2-3b-instruct:free",      label: "Llama 3.2 3B Instruct (free)" },
  { group: "🆓 Free Models",           value: "deepseek/deepseek-r1:free",                  label: "DeepSeek R1 (free)" },
  { group: "🆓 Free Models",           value: "deepseek/deepseek-chat-v3-0324:free",        label: "DeepSeek Chat V3 (free)" },
  { group: "🆓 Free Models",           value: "google/gemma-3-27b-it:free",                 label: "Google Gemma 3 27B (free)" },
  { group: "🆓 Free Models",           value: "google/gemma-3-12b-it:free",                 label: "Google Gemma 3 12B (free)" },
  { group: "🆓 Free Models",           value: "google/gemma-3-4b-it:free",                  label: "Google Gemma 3 4B (free)" },
  { group: "🆓 Free Models",           value: "mistralai/mistral-7b-instruct:free",         label: "Mistral 7B Instruct (free)" },
  { group: "🆓 Free Models",           value: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 3.1 24B (free)" },
  { group: "🆓 Free Models",           value: "qwen/qwen3-8b:free",                         label: "Qwen 3 8B (free)" },
  { group: "🆓 Free Models",           value: "qwen/qwen3-14b:free",                        label: "Qwen 3 14B (free)" },
  { group: "🆓 Free Models",           value: "qwen/qwen3-32b:free",                        label: "Qwen 3 32B (free)" },
  { group: "🆓 Free Models",           value: "qwen/qwen-2.5-72b-instruct:free",            label: "Qwen 2.5 72B (free)" },
  { group: "🆓 Free Models",           value: "microsoft/phi-4:free",                       label: "Microsoft Phi-4 (free)" },
  { group: "🆓 Free Models",           value: "nvidia/llama-3.1-nemotron-70b-instruct:free",label: "NVIDIA Nemotron 70B (free)" },
  // ── OpenAI ────────────────────────────────────────────────────────────────
  { group: "🤖 OpenAI",                value: "openai/gpt-4o",                              label: "GPT-4o" },
  { group: "🤖 OpenAI",                value: "openai/gpt-4o-mini",                         label: "GPT-4o Mini" },
  { group: "🤖 OpenAI",                value: "openai/gpt-4-turbo",                         label: "GPT-4 Turbo" },
  { group: "🤖 OpenAI",                value: "openai/o1",                                  label: "OpenAI o1" },
  { group: "🤖 OpenAI",                value: "openai/o3-mini",                             label: "OpenAI o3 Mini" },
  // ── Anthropic Claude ──────────────────────────────────────────────────────
  { group: "🔮 Anthropic",             value: "anthropic/claude-3.7-sonnet",                label: "Claude 3.7 Sonnet" },
  { group: "🔮 Anthropic",             value: "anthropic/claude-3.5-sonnet",                label: "Claude 3.5 Sonnet" },
  { group: "🔮 Anthropic",             value: "anthropic/claude-3.5-haiku",                 label: "Claude 3.5 Haiku" },
  { group: "🔮 Anthropic",             value: "anthropic/claude-3-opus",                    label: "Claude 3 Opus" },
  // ── Google ────────────────────────────────────────────────────────────────
  { group: "🌐 Google",                value: "google/gemini-2.0-flash-001",                label: "Gemini 2.0 Flash" },
  { group: "🌐 Google",                value: "google/gemini-2.5-pro-preview",              label: "Gemini 2.5 Pro Preview" },
  { group: "🌐 Google",                value: "google/gemini-flash-1.5",                    label: "Gemini 1.5 Flash" },
  { group: "🌐 Google",                value: "google/gemini-pro-1.5",                      label: "Gemini 1.5 Pro" },
  // ── Meta Llama (paid) ─────────────────────────────────────────────────────
  { group: "🦙 Meta Llama",            value: "meta-llama/llama-3.3-70b-instruct",          label: "Llama 3.3 70B" },
  { group: "🦙 Meta Llama",            value: "meta-llama/llama-3.1-405b-instruct",         label: "Llama 3.1 405B" },
  { group: "🦙 Meta Llama",            value: "meta-llama/llama-3.1-70b-instruct",          label: "Llama 3.1 70B" },
  // ── Mistral ───────────────────────────────────────────────────────────────
  { group: "🌊 Mistral",               value: "mistralai/mistral-large",                    label: "Mistral Large" },
  { group: "🌊 Mistral",               value: "mistralai/mistral-medium-3",                 label: "Mistral Medium 3" },
  { group: "🌊 Mistral",               value: "mistralai/mixtral-8x22b-instruct",           label: "Mixtral 8x22B" },
  // ── DeepSeek ──────────────────────────────────────────────────────────────
  { group: "🔍 DeepSeek",              value: "deepseek/deepseek-r1",                       label: "DeepSeek R1" },
  { group: "🔍 DeepSeek",              value: "deepseek/deepseek-chat-v3-0324",             label: "DeepSeek Chat V3" },
  // ── xAI Grok ──────────────────────────────────────────────────────────────
  { group: "⚡ xAI",                   value: "x-ai/grok-3-beta",                          label: "Grok 3 Beta" },
  { group: "⚡ xAI",                   value: "x-ai/grok-3-mini-beta",                     label: "Grok 3 Mini Beta" },
  // ── Cohere ────────────────────────────────────────────────────────────────
  { group: "📡 Cohere",                value: "cohere/command-r-plus",                      label: "Command R+" },
  { group: "📡 Cohere",                value: "cohere/command-r7b-12-2024",                 label: "Command R7B" },
  // ── Qwen (paid) ───────────────────────────────────────────────────────────
  { group: "🔡 Qwen",                  value: "qwen/qwen3-235b-a22b",                       label: "Qwen 3 235B" },
  { group: "🔡 Qwen",                  value: "qwen/qwen-2.5-72b-instruct",                 label: "Qwen 2.5 72B" },
];

const OR_GROUPS = [...new Set(OR_MODELS.map(m => m.group))];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [userEmail, setUserEmail]             = useState("");
  const [userId, setUserId]                   = useState("");
  const [provider, setProvider]               = useState("openrouter");
  const [apiKey, setApiKey]                   = useState("");
  const [orModel, setOrModel]                 = useState("meta-llama/llama-3.3-70b-instruct:free");
  const [currentHint, setCurrentHint]         = useState<string | null>(null);
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const [currentModel, setCurrentModel]       = useState<string | null>(null);
  const [saving, setSaving]                   = useState(false);
  const [removing, setRemoving]               = useState(false);
  const [testing, setTesting]                 = useState(false);
  const [saveMsg, setSaveMsg]                 = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testResult, setTestResult]           = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [connectingOR, setConnectingOR]        = useState(false);

  const mono = "var(--font-jetbrains), monospace";
  const syne = "var(--font-syne), sans-serif";

  useEffect(() => {
    // Handle OAuth callback result from URL params
    const orConnected = searchParams.get("or_connected");
    const orError     = searchParams.get("or_error");
    if (orConnected === "true") {
      setSaveMsg({ type: "success", text: "✓ OpenRouter connected! Your account is now linked." });
      window.history.replaceState({}, "", "/settings");
    } else if (orError) {
      const errMessages: Record<string, string> = {
        no_code:         "OAuth failed — no code received from OpenRouter.",
        exchange_failed: "Failed to exchange code for API key. Try again.",
        no_key_returned: "OpenRouter did not return a key. Try again.",
        save_failed:     "Key received but failed to save. Try manual entry.",
        network:         "Network error during OAuth. Try again.",
      };
      setSaveMsg({ type: "error", text: errMessages[orError] ?? "OpenRouter connection failed." });
      window.history.replaceState({}, "", "/settings");
    }

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserEmail(session.user.email ?? "");
      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("api_provider, api_key_hint, openrouter_model")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        const p = (profile.api_provider ?? "").toLowerCase().trim();
        setCurrentProvider(p || null);
        setCurrentHint(profile.api_key_hint ?? null);
        const m = profile.openrouter_model ?? "meta-llama/llama-3.3-70b-instruct:free";
        setCurrentModel(m);
        setOrModel(m);
        if (p) setProvider(p);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnectOpenRouter = () => {
    setConnectingOR(true);
    const callbackUrl = `${window.location.origin}/api/auth/openrouter/callback`;
    window.location.href = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(callbackUrl)}`;
  };

  const handleSave = async () => {
    if (!apiKey.trim()) { setSaveMsg({ type: "error", text: "Please enter an API key." }); return; }
    setSaving(true); setSaveMsg(null);
    try {
      const encoded = btoa(apiKey.trim());
      const hint    = apiKey.trim().slice(-4);
      const patch: Record<string, string> = {
        api_provider: provider,
        encrypted_api_key: encoded,
        api_key_hint: hint,
        openrouter_model: orModel,
      };

      const { error, count } = await supabase
        .from("user_profiles")
        .update(patch)
        .eq("user_id", userId)
        .select("user_id", { count: "exact", head: true });

      if (error) throw error;
      if ((count ?? 0) === 0) {
        const { error: ie } = await supabase.from("user_profiles").insert({ user_id: userId, ...patch });
        if (ie) throw ie;
      }

      setCurrentProvider(provider);
      setCurrentHint(hint);
      setCurrentModel(orModel);
      setApiKey("");
      setSaveMsg({ type: "success", text: "Saved! Click \"Test Connection\" to verify." });
    } catch (err) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save" });
    } finally { setSaving(false); }
  };

  const handleSaveModel = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_profiles")
      .update({ openrouter_model: orModel })
      .eq("user_id", userId);
    if (!error) { setCurrentModel(orModel); setSaveMsg({ type: "success", text: "Model preference saved." }); }
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
          NO_API_KEY:    "No API key saved. Save your key first.",
          LIMIT_REACHED: "Task limit reached.",
        };
        setTestResult({ type: "error", text: errMap[json.error] ?? (json.error || "Connection failed") });
      } else {
        setTestResult({ type: "success", text: "✓ Connected!   " + (json.output?.slice(0, 120) ?? "") });
      }
    } catch (err) {
      setTestResult({ type: "error", text: err instanceof Error ? err.message : "Connection failed" });
    } finally { setTesting(false); }
  };

  const currentModelLabel = OR_MODELS.find(m => m.value === currentModel)?.label ?? currentModel;
  const providerLabel     = PROVIDERS.find(p => p.value === currentProvider)?.label ?? currentProvider;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#FFF", fontFamily: mono, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #1A1A1A", backgroundColor: "#080808" }}>
        <button onClick={() => router.push("/workspace")} style={{ background: "none", border: "none", color: "#888", fontFamily: mono, fontSize: "13px", cursor: "pointer", padding: 0 }}>← Back to Workspace</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "12px", color: "#444" }}>{userEmail}</span>
      </div>

      <div style={{ flex: 1, maxWidth: "600px", margin: "48px auto", padding: "0 24px", width: "100%", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: syne, fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>Settings</h1>
        <p style={{ color: "#555", margin: "0 0 40px", fontSize: "14px" }}>Manage your API keys and model preferences.</p>

        {/* ── OpenRouter OAuth card ────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h2 style={{ fontFamily: syne, fontSize: "18px", fontWeight: 600, margin: 0 }}>Connect with OpenRouter</h2>
            <span style={{ fontSize: "11px", backgroundColor: "#002A12", color: "#22C55E", border: "1px solid #22C55E", padding: "2px 8px", borderRadius: "999px" }}>Recommended</span>
          </div>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 20px", lineHeight: 1.6 }}>
            One click — no copy-pasting. Log in with your OpenRouter account and we&apos;ll link it automatically.
            Uses your own credits. 300+ models. Always free to connect.
          </p>

          <button
            onClick={handleConnectOpenRouter}
            disabled={connectingOR}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px 24px", borderRadius: "8px", backgroundColor: connectingOR ? "#111" : "#060606", color: connectingOR ? "#555" : "#FFF", border: "1px solid #333", cursor: connectingOR ? "not-allowed" : "pointer", fontFamily: mono, fontSize: "14px", fontWeight: 600, transition: "all 0.2s", width: "100%", justifyContent: "center" }}
            onMouseEnter={e => { if (!connectingOR) (e.currentTarget as HTMLButtonElement).style.borderColor = "#06B6D4"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#333"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            {connectingOR ? "Redirecting to OpenRouter…" : "Connect with OpenRouter →"}
          </button>

          <p style={{ fontSize: "11px", color: "#444", margin: "12px 0 0", textAlign: "center" }}>
            You&apos;ll be taken to openrouter.ai → log in → redirected back here automatically.
          </p>
        </div>

        {/* divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#1A1A1A" }} />
          <span style={{ fontFamily: mono, fontSize: "11px", color: "#444" }}>or enter key manually</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#1A1A1A" }} />
        </div>

        {/* ── API Keys card ───────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: syne, fontSize: "18px", fontWeight: 600, margin: "0 0 6px" }}>Manual API Key</h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 20px", lineHeight: 1.6 }}>Paste your key from any provider below. Base64-encoded before storing. Never shared or logged.</p>

          {/* Active key status */}
          {currentProvider && currentHint ? (
            <div style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", borderRadius: "6px", padding: "14px 16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22C55E", boxShadow: "0 0 6px #22C55E", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>Active key</p>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#FFF" }}>{providerLabel} — <span style={{ color: "#555" }}>****{currentHint}</span></p>
                  </div>
                </div>
                <button onClick={handleRemove} disabled={removing} style={{ padding: "6px 12px", borderRadius: "4px", backgroundColor: "transparent", color: removing ? "#555" : "#EF4444", border: "1px solid #3A0000", cursor: removing ? "not-allowed" : "pointer", fontFamily: mono, fontSize: "11px" }}>{removing ? "Removing…" : "Remove Key"}</button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: "#0A0A0A", border: "1px solid #2A0000", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444", flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: "13px", color: "#EF4444" }}>No API key set — add one below to run tasks.</p>
            </div>
          )}

          {/* Provider selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>Provider</label>
            <select value={provider} onChange={e => setProvider(e.target.value)} style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF", padding: "12px 14px", fontFamily: mono, fontSize: "13px", borderRadius: "6px", outline: "none", appearance: "none", cursor: "pointer" }}>
              {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/* API Key input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
            <label style={{ fontSize: "12px", color: "#888" }}>API Key{currentHint ? " (leave blank to keep current)" : ""}</label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSave(); }} placeholder={currentHint ? `Current: ****${currentHint}` : "Paste your API key here"} style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF", padding: "12px 14px", fontFamily: mono, fontSize: "13px", borderRadius: "6px", outline: "none", width: "100%", boxSizing: "border-box" }} />
          </div>
          <p style={{ fontSize: "11px", color: "#444", margin: "0 0 20px" }}>🔒 Base64-encoded before storing. Never logged or sent elsewhere.</p>

          {saveMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "6px", marginBottom: "16px", backgroundColor: saveMsg.type === "success" ? "#002A12" : "#1A0000", border: `1px solid ${saveMsg.type === "success" ? "#22C55E" : "#EF4444"}`, color: saveMsg.type === "success" ? "#22C55E" : "#EF4444", fontSize: "13px" }}>{saveMsg.text}</div>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={handleSave} disabled={saving || !apiKey.trim()} style={{ padding: "12px 24px", borderRadius: "6px", backgroundColor: (saving || !apiKey.trim()) ? "#1A1A1A" : "#FFF", color: (saving || !apiKey.trim()) ? "#555" : "#000", border: "none", cursor: (saving || !apiKey.trim()) ? "not-allowed" : "pointer", fontFamily: mono, fontSize: "13px", fontWeight: 600 }}>{saving ? "Saving…" : "Save API Key"}</button>
            <button onClick={handleTest} disabled={testing || !currentHint} style={{ padding: "12px 24px", borderRadius: "6px", backgroundColor: "transparent", color: (testing || !currentHint) ? "#555" : "#888", border: "1px solid #333", cursor: (testing || !currentHint) ? "not-allowed" : "pointer", fontFamily: mono, fontSize: "13px" }}>{testing ? "Testing…" : "Test Connection"}</button>
          </div>

          {testResult && (
            <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "6px", backgroundColor: testResult.type === "success" ? "#002A12" : "#1A0000", border: `1px solid ${testResult.type === "success" ? "#22C55E" : "#EF4444"}`, color: testResult.type === "success" ? "#22C55E" : "#EF4444", fontSize: "12px", lineHeight: 1.7 }}>{testResult.text}</div>
          )}
        </div>

        {/* ── OpenRouter model picker card ────────────────────────────────── */}
        {(provider === "openrouter" || currentProvider === "openrouter") && (
          <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px", marginBottom: "20px" }}>
            <h2 style={{ fontFamily: syne, fontSize: "18px", fontWeight: 600, margin: "0 0 4px" }}>OpenRouter Model</h2>
            <p style={{ color: "#555", fontSize: "13px", margin: "0 0 6px", lineHeight: 1.5 }}>
              OpenRouter gives access to <strong style={{ color: "#888" }}>300+ models</strong> from OpenAI, Anthropic, Google, Meta, Mistral, DeepSeek, xAI and more.
              Free models are marked with <span style={{ color: "#22C55E" }}>:free</span>.
            </p>
            {currentModel && (
              <p style={{ fontSize: "11px", color: "#555", margin: "0 0 16px" }}>
                Currently using: <span style={{ color: "#AAA" }}>{currentModelLabel}</span>
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#888" }}>Select model</label>
              <select
                value={orModel}
                onChange={e => setOrModel(e.target.value)}
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A", color: "#FFF", padding: "12px 14px", fontFamily: mono, fontSize: "12px", borderRadius: "6px", outline: "none", appearance: "none", cursor: "pointer" }}
              >
                {OR_GROUPS.map(group => (
                  <optgroup key={group} label={group}>
                    {OR_MODELS.filter(m => m.group === group).map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div style={{ backgroundColor: "#050505", border: "1px solid #111", borderRadius: "6px", padding: "10px 12px", marginBottom: "16px" }}>
              <p style={{ fontFamily: mono, fontSize: "10px", color: "#444", margin: "0 0 4px" }}>SELECTED MODEL ID</p>
              <p style={{ fontFamily: mono, fontSize: "12px", color: "#06B6D4", margin: 0, wordBreak: "break-all" }}>{orModel}</p>
            </div>

            <p style={{ fontSize: "11px", color: "#444", margin: "0 0 16px", lineHeight: 1.6 }}>
              💡 Free models work without credits. Paid models need OpenRouter credits.{" "}
              <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" style={{ color: "#06B6D4", textDecoration: "none" }}>Browse all 300+ models →</a>
            </p>

            <button
              onClick={handleSaveModel}
              disabled={orModel === currentModel}
              style={{ padding: "10px 20px", borderRadius: "6px", backgroundColor: orModel !== currentModel ? "#FFF" : "#1A1A1A", color: orModel !== currentModel ? "#000" : "#555", border: "none", cursor: orModel !== currentModel ? "pointer" : "not-allowed", fontFamily: mono, fontSize: "13px", fontWeight: 600 }}
            >{orModel === currentModel ? "Model saved ✓" : "Save Model Choice"}</button>
          </div>
        )}

        {/* ── Account card ────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A", borderRadius: "8px", padding: "24px" }}>
          <h2 style={{ fontFamily: syne, fontSize: "18px", fontWeight: 600, margin: "0 0 6px" }}>Account</h2>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 16px" }}>{userEmail}</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} style={{ padding: "10px 20px", borderRadius: "6px", backgroundColor: "transparent", color: "#EF4444", border: "1px solid #3A0000", cursor: "pointer", fontFamily: mono, fontSize: "13px" }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

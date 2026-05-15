import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const SYSTEM_PROMPT = `You are Scout, elite research and lead generation agent for Orbium AI.
Help founders find leads, research markets and analyze competitors.
For lead requests always return:
1. Company Name, City
   Contact: Name, Title
   Email: real email or Find via LinkedIn
   Why: specific reason they need help
Return 8-10 leads minimum. Be specific, never make up emails.`;

export async function POST(req: Request) {
  try {
    const { task, userId } = await req.json();
    if (!task || !userId) {
      return Response.json({ error: "Missing task or userId" }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("api_provider, encrypted_api_key, selected_model, ollama_base_url, tasks_used, tasks_limit")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    const provider = (profile?.api_provider ?? "").toLowerCase().trim();

    // Meta/Ollama doesn't require an API key
    if (provider !== "meta" && !profile?.encrypted_api_key) {
      return Response.json({ error: "NO_API_KEY" }, { status: 400 });
    }
    if (!provider) {
      return Response.json({ error: "NO_API_KEY" }, { status: 400 });
    }

    const tasksUsed  = profile?.tasks_used  ?? 0;
    const tasksLimit = profile?.tasks_limit ?? 10;
    if (tasksUsed >= tasksLimit) {
      return Response.json({ error: "LIMIT_REACHED" }, { status: 403 });
    }

    const apiKey = profile?.encrypted_api_key
      ? Buffer.from(profile.encrypted_api_key, "base64").toString("utf-8").trim()
      : "";
    const model  = (profile?.selected_model ?? "").trim();
    const ollamaBase = (profile?.ollama_base_url ?? "http://localhost:11434").trim().replace(/\/$/, "");

    let output: string;

    // ── Google Gemini ──────────────────────────────────────────────────────
    if (provider === "gemini") {
      const geminiModel = model || "gemini-2.0-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\n" + task }] }],
          }),
        }
      );
      const json = await res.json();
      console.log("Scout / Gemini response:", JSON.stringify(json, null, 2));
      if (!res.ok) throw new Error(json?.error?.message ?? `Gemini error ${res.status}`);
      output = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!output) throw new Error("No output from Gemini");

    // ── Anthropic Claude ───────────────────────────────────────────────────
    } else if (provider === "claude") {
      const claudeModel = model || "claude-3-5-haiku-20241022";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: claudeModel,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: task }],
        }),
      });
      const json = await res.json();
      console.log("Scout / Claude response:", JSON.stringify(json, null, 2));
      if (!res.ok) throw new Error(json?.error?.message ?? `Claude error ${res.status}`);
      output = json?.content?.[0]?.text;
      if (!output) throw new Error("No output from Claude");

    // ── OpenAI ChatGPT ─────────────────────────────────────────────────────
    } else if (provider === "openai") {
      const openaiModel = model || "gpt-4o-mini";
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: openaiModel,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: task }],
        }),
      });
      const json = await res.json();
      console.log("Scout / OpenAI response:", JSON.stringify(json, null, 2));
      if (!res.ok) throw new Error(json?.error?.message ?? `OpenAI error ${res.status}`);
      output = json?.choices?.[0]?.message?.content;
      if (!output) throw new Error("No output from OpenAI");

    // ── Meta AI via Ollama (local or remote) ───────────────────────────────
    } else if (provider === "meta") {
      const ollamaModel = model || "llama3.3:latest";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const res = await fetch(`${ollamaBase}/v1/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: ollamaModel,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: task }],
          stream: false,
        }),
      });
      const json = await res.json();
      console.log("Scout / Ollama response:", JSON.stringify(json, null, 2));
      if (!res.ok) throw new Error(json?.error?.message ?? json?.error ?? `Ollama error ${res.status}`);
      output = json?.choices?.[0]?.message?.content;
      if (!output) throw new Error("No output from Ollama. Is `ollama serve` running?");

    } else {
      throw new Error(`Unknown provider: "${provider}". Go to Settings and configure your AI.`);
    }

    // Increment task counter
    await supabase
      .from("user_profiles")
      .update({ tasks_used: tasksUsed + 1 })
      .eq("user_id", userId);

    return Response.json({ output });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Scout agent error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

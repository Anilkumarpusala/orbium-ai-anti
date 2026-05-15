import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const SYSTEM_PROMPT = `You are Aria, elite content and marketing agent for Orbium AI.
Create content that attracts customers.
For LinkedIn return:
HOOK: first attention-grabbing line
BODY: 3-5 short punchy paragraphs
CTA: clear call to action
For content strategy: return 30 day calendar with specific post ideas for each week.
Match founder voice. Never generic.`;

export async function POST(req: Request) {
  try {
    const { task, userId } = await req.json();

    if (!task || !userId) {
      return Response.json({ error: "Missing task or userId" }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // ── Fetch profile (includes model choice) ──────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("api_provider, encrypted_api_key, openrouter_model, tasks_used, tasks_limit")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    if (!profile?.encrypted_api_key) {
      return Response.json({ error: "NO_API_KEY" }, { status: 400 });
    }

    // ── Task limit check ───────────────────────────────────────────────────
    const tasksUsed  = profile.tasks_used  ?? 0;
    const tasksLimit = profile.tasks_limit ?? 10;
    if (tasksUsed >= tasksLimit) {
      return Response.json({ error: "LIMIT_REACHED" }, { status: 403 });
    }

    // ── Decode API key ─────────────────────────────────────────────────────
    const apiKey   = Buffer.from(profile.encrypted_api_key, "base64").toString("utf-8").trim();
    const provider = (profile.api_provider ?? "").toLowerCase().trim();
    const orModel  = (profile.openrouter_model ?? "deepseek/deepseek-r1:free").trim();

    // ── Call LLM ───────────────────────────────────────────────────────────
    let output: string;

    if (provider === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://orbiumai.com",
          "X-Title": "Orbium AI",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: orModel,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user",   content: task },
          ],
        }),
      });

      const json = await res.json();
      console.log("Aria / OpenRouter response:", JSON.stringify(json, null, 2));

      if (!res.ok) {
        const raw = json?.error?.metadata?.raw;
        const msg = (typeof raw === "string" ? raw : null)
          ?? json?.error?.message
          ?? json?.message
          ?? `OpenRouter error ${res.status}`;
        throw new Error(msg);
      }

      output = json?.choices?.[0]?.message?.content;
      if (!output) throw new Error("No output returned from model");

    } else if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\n" + task }] }],
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? `Gemini error ${res.status}`);
      output = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!output) throw new Error("No output from Gemini");

    } else if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: task }],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? `OpenAI error ${res.status}`);
      output = json?.choices?.[0]?.message?.content;
      if (!output) throw new Error("No output from OpenAI");

    } else if (provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: task }],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? `Groq error ${res.status}`);
      output = json?.choices?.[0]?.message?.content;
      if (!output) throw new Error("No output from Groq");

    } else if (provider === "claude") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: task }],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? `Claude error ${res.status}`);
      output = json?.content?.[0]?.text;
      if (!output) throw new Error("No output from Claude");

    } else {
      throw new Error(`Unknown provider: "${provider}". Go to Settings and set your provider.`);
    }

    // ── Increment task counter ─────────────────────────────────────────────
    await supabase
      .from("user_profiles")
      .update({ tasks_used: tasksUsed + 1 })
      .eq("user_id", userId);

    return Response.json({ output });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Aria agent error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

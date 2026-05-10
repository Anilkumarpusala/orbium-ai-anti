import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const SYSTEM_PROMPT = `You are Rex, elite sales outreach agent for Orbium AI.
Write cold emails and sequences that get replies.
Never sound like a template. Always personalize based on lead info.
Return exactly:
SUBJECT: subject line here
EMAIL:
full email body here
FOLLOW-UP 1 (Day 3):
short followup here
FOLLOW-UP 2 (Day 7):
final followup here`;

async function callLLM(
  provider: string,
  apiKey: string,
  task: string
): Promise<string> {
  if (provider === "openrouter") {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://orbiumai.com",
        "X-Title": "Orbium AI",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: task },
        ],
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "OpenRouter error");
    return json.choices[0].message.content;
  }

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: SYSTEM_PROMPT + "\n\n" + task }] }],
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Gemini error");
    return json.candidates[0].content.parts[0].text;
  }

  if (provider === "openai" || provider === "groq") {
    const baseURL =
      provider === "groq"
        ? "https://api.groq.com/openai/v1"
        : "https://api.openai.com/v1";
    const model =
      provider === "groq" ? "llama-3.1-8b-instant" : "gpt-4o-mini";
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: task },
        ],
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "API error");
    return json.choices[0].message.content;
  }

  if (provider === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-3-5",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: task }],
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Claude error");
    return json.content[0].text;
  }

  throw new Error("Unknown provider: " + provider);
}

export async function POST(req: Request) {
  try {
    const { task, userId } = await req.json();

    if (!task || !userId) {
      return Response.json({ error: "Missing task or userId" }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("api_provider, encrypted_api_key, tasks_used, tasks_limit")
      .eq("user_id", userId)
      .single();

    if (!profile?.encrypted_api_key) {
      return Response.json({ error: "NO_API_KEY" }, { status: 400 });
    }

    const tasksUsed = profile.tasks_used ?? 0;
    const tasksLimit = profile.tasks_limit ?? 10;
    if (tasksUsed >= tasksLimit) {
      return Response.json({ error: "LIMIT_REACHED" }, { status: 403 });
    }

    const apiKey = Buffer.from(profile.encrypted_api_key, "base64")
      .toString("utf-8")
      .trim();
    const provider = (profile.api_provider ?? "").toLowerCase().trim();

    const output = await callLLM(provider, apiKey, task);

    await supabase
      .from("user_profiles")
      .update({ tasks_used: tasksUsed + 1 })
      .eq("user_id", userId);

    return Response.json({ output });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Rex error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

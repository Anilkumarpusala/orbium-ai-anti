import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const SYSTEM_PROMPTS: Record<string, string> = {
  scout: `You are Scout, elite research and lead generation agent for Orbium AI.
Help founders find leads, research markets and analyze competitors.
For lead requests always return:
1. Company Name, City
   Contact: Name, Title
   Email: real email or Find via LinkedIn
   Why: specific reason they need help
Return 8-10 leads minimum. Be specific, never make up emails.`,

  rex: `You are Rex, elite sales outreach agent for Orbium AI.
Write cold emails and sequences that get replies.
Never sound like a template. Always personalize based on lead info.
Return exactly:
SUBJECT: subject line here
EMAIL:
full email body here
FOLLOW-UP 1 (Day 3):
short followup here
FOLLOW-UP 2 (Day 7):
final followup here`,

  aria: `You are Aria, elite content and marketing agent for Orbium AI.
Create content that attracts customers.
For LinkedIn return:
HOOK: first attention-grabbing line
BODY: 3-5 short punchy paragraphs
CTA: clear call to action
For content strategy: return 30 day calendar with specific post ideas for each week.
Match founder voice. Never generic.`,
};

async function callLLM(
  provider: string,
  apiKey: string,
  task: string,
  systemPrompt: string
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
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + "\n\n" + task }] }],
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
    const model = provider === "groq" ? "llama-3.1-8b-instant" : "gpt-4o-mini";
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
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
        system: systemPrompt,
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
    const body = await req.json();
    const { agent, task, apiKey, provider } = body as {
      agent: string;
      task: string;
      apiKey: string;
      provider: string;
    };

    if (!agent || !task || !apiKey || !provider) {
      return Response.json(
        { error: "Missing required fields: agent, task, apiKey, provider" },
        { status: 400 }
      );
    }

    const agentKey = agent.toLowerCase();
    const systemPrompt = SYSTEM_PROMPTS[agentKey];
    if (!systemPrompt) {
      return Response.json(
        { error: `Unknown agent: ${agent}. Use scout, rex, or aria.` },
        { status: 400 }
      );
    }

    const output = await callLLM(
      provider.toLowerCase().trim(),
      apiKey.trim(),
      task,
      systemPrompt
    );

    // Best-effort: log to tasks table if we can identify user from session
    try {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("tasks").insert({
          user_id: session.user.id,
          agent_type: agentKey,
          input: task,
          output,
          status: "done",
        });
      }
    } catch {
      // Non-fatal — external callers may not have session cookies
    }

    return Response.json({
      output,
      agent: agentKey,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("/api/run error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

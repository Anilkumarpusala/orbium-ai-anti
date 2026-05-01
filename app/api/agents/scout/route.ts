import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SCOUT_SYSTEM_PROMPT = `You are Scout, an elite business research and lead generation agent for Orbium AI.

Your job is to help founders find leads, research markets, analyze competitors, and gather business intelligence.

When finding leads always return structured data in this format:
1. Company Name, Location
   Decision Maker: [name]
   Email: [email if findable, otherwise say "Find via LinkedIn"]
   Why they need help: [specific reason]

Be specific, actionable, and thorough.
Never make up emails — say "Find via LinkedIn" if unknown.
Always return at least 5-10 results for lead requests.`;

// ─── Helper: call Gemini ───────────────────────────────────────────────────────
async function callGemini(apiKey: string, task: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SCOUT_SYSTEM_PROMPT,
  });
  const result = await model.generateContent(task);
  return result.response.text();
}

// ─── Helper: call OpenAI-compatible APIs ───────────────────────────────────────
async function callOpenAICompat(
  apiKey: string,
  task: string,
  model: string,
  baseURL?: string
): Promise<string> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SCOUT_SYSTEM_PROMPT },
      { role: "user", content: task },
    ],
    max_tokens: 2048,
  });
  return response.choices[0]?.message?.content ?? "No response received.";
}

// ─── Helper: call Anthropic ───────────────────────────────────────────────────
async function callClaude(apiKey: string, task: string): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-haiku-3-5",
    max_tokens: 2048,
    system: SCOUT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: task }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "No response received.";
}

// ─── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { task, userId } = await request.json() as { task: string; userId: string };

    if (!task || !userId) {
      return NextResponse.json({ error: "Missing task or userId" }, { status: 400 });
    }

    // Create Supabase server client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Verify session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile for API key
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("api_provider, encrypted_api_key")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.encrypted_api_key) {
      return NextResponse.json(
        { error: "NO_API_KEY" },
        { status: 422 }
      );
    }

    // Decode key (stored as base64 from onboarding)
    let apiKey: string;
    try {
      apiKey = Buffer.from(profile.encrypted_api_key, "base64").toString("utf-8");
    } catch {
      return NextResponse.json({ error: "Failed to decode API key" }, { status: 500 });
    }

    const provider = (profile.api_provider ?? "").toLowerCase();

    // Call LLM based on provider
    let output: string;
    if (provider.includes("gemini")) {
      output = await callGemini(apiKey, task);
    } else if (provider.includes("openai")) {
      output = await callOpenAICompat(apiKey, task, "gpt-4o-mini");
    } else if (provider.includes("claude")) {
      output = await callClaude(apiKey, task);
    } else if (provider.includes("groq")) {
      output = await callOpenAICompat(
        apiKey, task, "llama-3.1-8b-instant",
        "https://api.groq.com/openai/v1"
      );
    } else if (provider.includes("openrouter")) {
      output = await callOpenAICompat(
        apiKey, task, "google/gemini-flash-1.5",
        "https://openrouter.ai/api/v1"
      );
    } else {
      // Default to Gemini if unclear
      output = await callGemini(apiKey, task);
    }

    return NextResponse.json({ output });
  } catch (err: unknown) {
    console.error("Scout agent error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/settings?or_error=no_code`);
  }

  // Exchange the one-time code for a real OpenRouter API key
  let apiKey: string;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenRouter key exchange failed:", err);
      return NextResponse.redirect(`${origin}/settings?or_error=exchange_failed`);
    }

    const json = await res.json();
    apiKey = json.key;

    if (!apiKey) {
      return NextResponse.redirect(`${origin}/settings?or_error=no_key_returned`);
    }
  } catch (err) {
    console.error("OpenRouter OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/settings?or_error=network`);
  }

  // Get current user from session cookie
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // User session expired during OAuth flow
    return NextResponse.redirect(`${origin}/login`);
  }

  // Save key to Supabase (same encrypted format as manual entry)
  const encoded = Buffer.from(apiKey.trim()).toString("base64");
  const hint    = apiKey.trim().slice(-4);

  const { error } = await supabase
    .from("user_profiles")
    .update({
      api_provider: "openrouter",
      encrypted_api_key: encoded,
      api_key_hint: hint,
      openrouter_model: "meta-llama/llama-3.3-70b-instruct:free",
    })
    .eq("user_id", session.user.id);

  if (error) {
    console.error("Failed to save OpenRouter key:", error.message);
    return NextResponse.redirect(`${origin}/settings?or_error=save_failed`);
  }

  // All good — redirect back to Settings with success flag
  return NextResponse.redirect(`${origin}/settings?or_connected=true`);
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = await createClient(request);
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Supabase middleware auth error:", error);
    }
    
    const url = request.nextUrl.clone();
    
    if (session) {
      // Check onboarding status
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', session.user.id)
        .single();
      
      const isOnboardingCompleted = profile?.onboarding_completed === true;

      // If accessing workspace but onboarding is not completed
      if (url.pathname.startsWith("/workspace") && !isOnboardingCompleted) {
        console.log("Onboarding not completed, redirecting to onboarding");
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      // If accessing onboarding but onboarding is already completed
      if (url.pathname.startsWith("/onboarding") && isOnboardingCompleted) {
        console.log("Onboarding completed, redirecting to workspace");
        url.pathname = "/workspace";
        return NextResponse.redirect(url);
      }

      // If accessing login/signup and already logged in
      if (url.pathname === "/login" || url.pathname === "/signup") {
        console.log("Already logged in, redirecting based on onboarding status");
        url.pathname = isOnboardingCompleted ? "/workspace" : "/onboarding";
        return NextResponse.redirect(url);
      }
    } else {
      // Not logged in
      if (
        url.pathname.startsWith("/workspace") ||
        url.pathname.startsWith("/onboarding") ||
        url.pathname.startsWith("/settings")
      ) {
        console.log("Unauthorized access, redirecting to login");
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

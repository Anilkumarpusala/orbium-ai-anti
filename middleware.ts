import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    // This `createClient` function is from our utils, which uses @supabase/ssr
    // and handles updating the session cookie automatically.
    const { supabase, response } = await createClient(request);
    
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase middleware auth error:", error);
    }

    // Example simple protection: if navigating to /workspace and not logged in, redirect to /login
    const url = request.nextUrl.clone();
    
    if (url.pathname.startsWith("/workspace") && !session) {
      console.log("Unauthorized access to workspace, redirecting to login");
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // If logged in and on login/signup page, redirect to workspace
    if ((url.pathname === "/login" || url.pathname === "/signup") && session) {
      console.log("Already logged in, redirecting to workspace");
      url.pathname = "/workspace";
      return NextResponse.redirect(url);
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

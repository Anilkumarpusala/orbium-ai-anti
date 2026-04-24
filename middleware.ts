import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase middleware auth error:", error);
    }

    // Example simple protection: if navigating to /workspace and not logged in, redirect to /login
    const url = req.nextUrl.clone();
    
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

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

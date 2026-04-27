import { NextResponse, type NextRequest } from "next/server";
// import { createClient } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    // TEMPORARILY DISABLED DB CONNECTION FOR DEBUGGING
    // const { supabase, response } = await createClient(request);
    // const {
    //   data: { session },
    //   error
    // } = await supabase.auth.getSession();
    
    const url = request.nextUrl.clone();
    
    // Allow pass-through for now
    return NextResponse.next();
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

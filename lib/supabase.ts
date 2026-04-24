import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Browser client for client-side components
export const createBrowserSupabaseClient = () => {
  try {
    return createClientComponentClient();
  } catch (error) {
    console.error("Error creating browser Supabase client:", error);
    throw error;
  }
};

// Server client for Server Components, Server Actions, and Route Handlers
export const createServerSupabaseClient = () => {
  try {
    const cookieStore = cookies();
    return createServerComponentClient({ cookies: () => cookieStore });
  } catch (error) {
    console.error("Error creating server Supabase client:", error);
    throw error;
  }
};

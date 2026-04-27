import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // TEMPORARILY DISABLED DB CONNECTION FOR DEBUGGING
  // const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    let mounted = true;

    // Simulate auth check
    setTimeout(() => {
      if (mounted) {
        setUser({ id: '123', email: 'test@example.com' } as any);
        setLoading(false);
      }
    }, 500);

    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading, supabase: null as any };
}

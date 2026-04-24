import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../lib/supabase";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export default async function HomePage() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error checking session on home page:", error);
    }

    if (session) {
      console.log("Session found, redirecting to workspace");
      redirect("/workspace");
    } else {
      console.log("No session, redirecting to login");
      redirect("/login");
    }
  } catch (error) {
    console.error("Home page error:", error);
    // If there's an error, default to login
    redirect("/login");
  }

  // Fallback UI in case redirect takes a moment
  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", alignItems: "center", justifyContent: "center" }}>
      <LoadingSpinner size={48} />
    </div>
  );
}

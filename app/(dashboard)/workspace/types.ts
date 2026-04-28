export type AgentType = "scout" | "rex" | "aria";
export type TaskStatus = "pending" | "running" | "done" | "error";

export interface Task {
  id: string;
  user_id: string;
  agent_type: AgentType;
  input: string;
  output: string | null;
  status: TaskStatus;
  created_at: string;
}

export interface Agent {
  id: AgentType;
  name: string;
  role: string;
  color: string;
  dimColor: string;
}

export const AGENTS: Agent[] = [
  { id: "scout", name: "Scout", role: "Research", color: "#06B6D4", dimColor: "#0e4f5c" },
  { id: "rex",   name: "Rex",   role: "Sales",    color: "#F59E0B", dimColor: "#5c3d0a" },
  { id: "aria",  name: "Aria",  role: "Marketing", color: "#EC4899", dimColor: "#5c1a3a" },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "mock-1",
    user_id: "mock",
    agent_type: "scout",
    input: "Find leads for web design agency in UK restaurants",
    output: `Found 10 leads:

1. The Ivy Restaurant, London
   Owner: James Martin
   Email: james@theivyrestaurant.com
   Why: Outdated website, high revenue

2. Dishoom, Manchester
   Owner: Shamil Thakrar
   Email: hello@dishoom.com
   Why: No booking integration, heavy footfall

3. Hawksmoor, Edinburgh
   Owner: Will Beckett
   Email: will@thehawksmoor.com
   Why: Mobile site broken, premium brand

4. Brasserie Blanc, Oxford
   Owner: Raymond Blanc
   Email: raymond@brasserieblanc.com
   Why: Generic template, poor SEO

5. The Ledbury, Notting Hill
   Owner: Brett Graham
   Email: brett@theledbury.com
   Why: No online menu, Michelin-starred

6. Gymkhana, Mayfair
   Owner: Karam Sethi
   Email: karam@gymkhanalondon.com
   Why: Slow page load, dated design

7. Ottolenghi, Islington
   Owner: Yotam Ottolenghi
   Email: yotam@ottolenghi.co.uk
   Why: eCommerce gap, huge brand reach

8. Benares, Mayfair
   Owner: Atul Kochhar
   Email: atul@benaresrestaurant.com
   Why: No CTA on homepage

9. Barrafina, Covent Garden
   Owner: Sam Hart
   Email: sam@barrafina.co.uk
   Why: Menu only as PDF, no mobile UX

10. Kiln, Soho
    Owner: Ben Chapman
    Email: ben@kilnsoho.com
    Why: Basic Squarespace site, growing brand`,
    status: "done",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "mock-2",
    user_id: "mock",
    agent_type: "rex",
    input: "Write cold email for web design leads",
    output: `Subject: Quick question about your website

Hi James,

I noticed The Ivy's website could use a refresh — specifically the mobile experience and booking flow feel a bit dated compared to your brand's prestige.

We've helped 3 other London restaurants increase online reservations by 40%+ with a clean redesign.

Would you be open to a 15-min call this week to see if it could work for you?

Best,
[Your Name]
[Your Agency]

P.S. — No hard sell, just a quick look at what's possible.

---

VARIANTS FOR OTHER LEADS:

Hi Shamil,
Dishoom's brand is incredible but the online booking journey loses momentum. We have a specific fix for this...

Hi Will,
Hawksmoor's mobile site isn't matching the in-person experience. Here's what we'd do differently...`,
    status: "done",
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "mock-3",
    user_id: "mock",
    agent_type: "aria",
    input: "Create LinkedIn post about restaurant web design wins",
    output: null,
    status: "running",
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
];

export const QUICK_ACTIONS = [
  { label: "🔍 Find leads", prompt: "@scout find 10 leads for my web design agency in UK" },
  { label: "✉️ Write outreach", prompt: "@rex write a cold email for my top leads" },
  { label: "📣 Create content", prompt: "@aria create a LinkedIn post about our latest client win" },
];

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

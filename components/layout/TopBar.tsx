import { ChevronDown, Sparkles } from "lucide-react"

export function TopBar() {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-900 bg-[#0A0A0A]/90 px-8 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-zinc-900/50 rounded-md px-2 py-1.5 transition-colors">
                    <span className="text-sm font-medium text-zinc-300">Acme Corp Workspace</span>
                    <ChevronDown className="h-4 w-4 text-zinc-600" />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex h-8 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 pl-2.5 pr-3 shadow-sm transition-colors hover:bg-zinc-800/80 cursor-pointer">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-xs font-medium text-zinc-300">GPT-4o Active</span>
                    <div className="ml-1 flex items-center gap-1.5 border-l border-zinc-700/50 pl-2.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">OpenAI</span>
                    </div>
                </div>

                <button className="h-8 w-8 overflow-hidden rounded-full border border-zinc-800 bg-zinc-800 transition-transform hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-zinc-700/50">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=27272a"
                        alt="User avatar"
                        className="h-full w-full object-cover"
                    />
                </button>
            </div>
        </header>
    )
}

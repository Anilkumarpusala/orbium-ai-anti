import { LayoutDashboard, Folder, Wrench, Key, CreditCard, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "#", icon: LayoutDashboard, current: false },
    { name: "Projects", href: "#", icon: Folder, current: false },
    { name: "Build", href: "#", icon: Wrench, current: true },
    { name: "API Keys", href: "#", icon: Key, current: false },
    { name: "Billing", href: "#", icon: CreditCard, current: false },
    { name: "Settings", href: "#", icon: Settings, current: false },
]

export function Sidebar() {
    return (
        <div className="flex h-screen w-64 flex-col border-r border-zinc-900 bg-[#0A0A0A] px-4 py-6">
            <div className="mb-8 flex items-center px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 text-zinc-950 shadow-sm">
                    <Wrench className="h-5 w-5" />
                </div>
                <span className="ml-3 text-sm font-semibold tracking-wide text-zinc-100">DevTeam OS</span>
            </div>

            <nav className="flex flex-1 flex-col gap-1">
                {navigation.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                            item.current
                                ? "bg-zinc-900/80 text-zinc-100 shadow-sm ring-1 ring-zinc-800"
                                : "text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-200"
                        )}
                    >
                        <item.icon
                            className={cn(
                                "mr-3 h-4 w-4 shrink-0 transition-colors",
                                item.current ? "text-zinc-100" : "text-zinc-600 group-hover:text-zinc-400"
                            )}
                        />
                        {item.name}
                    </a>
                ))}
            </nav>

            <div className="mt-auto px-2">
                <div className="flex items-center gap-3 rounded-lg border border-zinc-800/50 bg-[#121212] px-3 py-2.5 shadow-sm">
                    <div className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-xs font-medium text-zinc-400">Systems Online</span>
                </div>
            </div>
        </div>
    )
}

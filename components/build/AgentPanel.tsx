import { Badge } from "@/components/ui/Badge"
import { BrainCircuit, Code2, ShieldCheck, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type AgentStatus = "idle" | "running" | "completed"

interface AgentProps {
    title: string;
    description: string;
    status: AgentStatus;
    icon: React.ElementType;
}

function AgentCard({ title, description, status, icon: Icon }: AgentProps) {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border p-5 transition-all duration-500",
            status === "idle" ? "border-zinc-800/50 bg-[#0A0A0A] opacity-50 grayscale" : "",
            status === "running" ? "border-indigo-500/30 bg-[#121212] shadow-[0_0_30px_rgba(99,102,241,0.05)] scale-[1.02]" : "",
            status === "completed" ? "border-emerald-500/20 bg-[#0A0A0A]" : ""
        )}>
            {status === "running" && (
                <div className="absolute top-0 left-0 h-1 w-full bg-indigo-500/10 overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[40%] animate-[pulse_1.5s_ease-in-out_infinite]" />
                </div>
            )}

            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm border",
                        status === "idle" ? "border-zinc-800 bg-zinc-900 text-zinc-600" : "",
                        status === "running" ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" : "",
                        status === "completed" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : ""
                    )}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-100">{title}</h3>
                        <p className="text-sm mt-1 text-zinc-400">{description}</p>
                    </div>
                </div>

                <div className="shrink-0 ml-4 hidden sm:block">
                    {status === "idle" && <Badge variant="outline">Waiting</Badge>}
                    {status === "running" && (
                        <Badge variant="running" className="animate-pulse">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Thinking...
                        </Badge>
                    )}
                    {status === "completed" && (
                        <Badge variant="success">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    )
}

interface AgentPanelProps {
    architectStatus: AgentStatus;
    developerStatus: AgentStatus;
    qaStatus: AgentStatus;
}

export function AgentPanel({ architectStatus, developerStatus, qaStatus }: AgentPanelProps) {
    return (
        <div className="w-full max-w-3xl mx-auto mt-12 space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-2 mb-8 ml-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">DevTeam Operating...</h2>
            </div>

            <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-[39px] before:-translate-x-px sm:before:mx-auto sm:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                <AgentCard
                    title="Architect Agent"
                    description="Designing structure, determining optimal patterns and creating the blueprint."
                    status={architectStatus}
                    icon={BrainCircuit}
                />
                <AgentCard
                    title="Developer Agent"
                    description="Writing React components, styling with Tailwind, and wiring logic."
                    status={developerStatus}
                    icon={Code2}
                />
                <AgentCard
                    title="QA Agent"
                    description="Validating files, checking syntax, and ensuring production readiness."
                    status={qaStatus}
                    icon={ShieldCheck}
                />
            </div>
        </div>
    )
}

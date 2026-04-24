import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "outline" | "success" | "warning" | "running"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2",
                {
                    "border-transparent bg-zinc-800 text-zinc-50": variant === "default",
                    "border-zinc-700/50 text-zinc-300 bg-zinc-900/50": variant === "outline",
                    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400": variant === "success",
                    "border-amber-500/20 bg-amber-500/10 text-amber-400": variant === "warning",
                    "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]": variant === "running",
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }

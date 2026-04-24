import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "ghost" | "outline"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-zinc-950 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-zinc-50 text-zinc-900 hover:bg-zinc-200 shadow-[0_0_12px_rgba(255,255,255,0.1)]": variant === "default",
                        "bg-zinc-800 text-zinc-50 hover:bg-zinc-700/80 shadow-sm border border-zinc-700/50": variant === "secondary",
                        "hover:bg-zinc-800 hover:text-zinc-50": variant === "ghost",
                        "border border-zinc-700 bg-transparent hover:bg-zinc-800 hover:text-zinc-50": variant === "outline",
                        "h-10 px-4 py-2": size === "default",
                        "h-9 rounded-md px-3": size === "sm",
                        "h-11 rounded-md px-8": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

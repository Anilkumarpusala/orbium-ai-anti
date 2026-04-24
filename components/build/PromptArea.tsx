import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Sparkles } from "lucide-react"

interface PromptAreaProps {
    onGenerate: (prompt: string) => void;
    disabled: boolean;
}

export function PromptArea({ onGenerate, disabled }: PromptAreaProps) {
    const [prompt, setPrompt] = useState("")

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto mt-20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
                    What will we build today?
                </h1>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                    Describe your project and our AI agents will architect, build, and validate the complete source code.
                </p>
            </div>

            <div className="w-full relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-800 to-zinc-800 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
                <div className="relative flex flex-col w-full bg-[#121212] rounded-2xl border border-zinc-800/80 shadow-2xl overflow-hidden focus-within:border-zinc-700/80 transition-colors">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full min-h-[160px] bg-transparent text-zinc-100 placeholder:text-zinc-600 p-6 resize-none focus:outline-none text-lg selection:bg-indigo-500/30"
                        placeholder="Describe the project you want to build..."
                        disabled={disabled}
                    />
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border-t border-zinc-900">
                        <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5 px-2">
                            <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> Powered by your API keys
                        </span>
                        <Button
                            size="lg"
                            onClick={() => onGenerate(prompt || "Empty project")}
                            disabled={disabled}
                            className="bg-zinc-100 text-zinc-900 hover:bg-white px-8 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] h-11"
                        >
                            Generate Project
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

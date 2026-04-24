import { Button } from "@/components/ui/Button"
import { Download, Rocket } from "lucide-react"

export function FinalActions() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button size="lg" className="w-full sm:w-auto min-w-[220px] h-12 bg-zinc-100 text-zinc-900 hover:bg-white font-semibold shadow-[0_0_20px_rgba(255,255,255,0.15)] gap-2 group transition-all hover:scale-[1.02] active:scale-95">
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:duration-200" />
                Download Project (.zip)
            </Button>

            <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[220px] h-12 bg-[#121212] gap-2 border-zinc-800 hover:bg-zinc-900 transition-all hover:scale-[1.02] active:scale-95 text-zinc-300 hover:text-zinc-100">
                <Rocket className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                Deploy With DevTeam OS
            </Button>
        </div>
    )
}

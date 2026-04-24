import { Folder, FolderOpen, FileCode, FileJson, FileType2, FileText, ChevronRight } from "lucide-react"

export function FileTreePreview() {
    return (
        <div className="w-full max-w-3xl mx-auto mt-12 bg-[#0A0A0A] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 px-4 py-3 bg-[#121212] border-b border-zinc-800/80">
                <div className="flex gap-1.5 ml-1">
                    <div className="w-3 h-3 rounded-full bg-zinc-800 hover:bg-red-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-zinc-800 hover:bg-yellow-500 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-zinc-800 hover:bg-green-500 transition-colors" />
                </div>
                <div className="flex-1 text-center font-mono text-xs text-zinc-500 tracking-wider uppercase">Project Structure generated</div>
                <div className="w-12" /> {/* Spacer for centering */}
            </div>

            <div className="p-6 font-mono text-sm overflow-x-auto">
                <ul className="space-y-1.5 min-w-max">
                    <li className="flex items-center gap-2 text-zinc-300 py-1 hover:bg-zinc-900/50 rounded px-2 cursor-pointer transition-colors">
                        <ChevronRight className="w-4 h-4 text-zinc-600 transition-transform rotate-90" />
                        <FolderOpen className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium">app</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400 py-1 hover:bg-zinc-900/50 rounded px-2 pl-8 cursor-pointer transition-colors">
                        <span className="w-4 h-4" />
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span>page.tsx</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400 py-1 hover:bg-zinc-900/50 rounded px-2 pl-8 cursor-pointer transition-colors">
                        <span className="w-4 h-4" />
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span>layout.tsx</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400 py-1 hover:bg-zinc-900/50 rounded px-2 pl-8 cursor-pointer transition-colors">
                        <span className="w-4 h-4" />
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span>globals.css</span>
                    </li>

                    <li className="flex items-center gap-2 text-zinc-300 py-1 hover:bg-zinc-900/50 rounded px-2 mt-2 cursor-pointer transition-colors">
                        <ChevronRight className="w-4 h-4 text-zinc-600 transition-transform rotate-90" />
                        <FolderOpen className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium">components</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400 py-1 hover:bg-zinc-900/50 rounded px-2 pl-8 cursor-pointer transition-colors">
                        <ChevronRight className="w-4 h-4 text-zinc-600 transition-transform rotate-90" />
                        <Folder className="w-4 h-4 text-zinc-500" />
                        <span>ui</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400 py-1 hover:bg-zinc-900/50 rounded px-2 pl-14 cursor-pointer transition-colors">
                        <span className="w-4 h-4" />
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span>Button.tsx</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400 py-1 hover:bg-zinc-900/50 rounded px-2 pl-14 cursor-pointer transition-colors">
                        <span className="w-4 h-4" />
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span>Badge.tsx</span>
                    </li>

                    <li className="flex items-center gap-2 text-zinc-400 py-1 hover:bg-zinc-900/50 rounded px-2 mt-3 cursor-pointer transition-colors border-t border-zinc-800/50 pt-3">
                        <span className="w-4 h-4" />
                        <FileJson className="w-4 h-4 text-amber-400" />
                        <span>package.json</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400 py-1 hover:bg-zinc-900/50 rounded px-2 cursor-pointer transition-colors">
                        <span className="w-4 h-4" />
                        <FileText className="w-4 h-4 text-zinc-400" />
                        <span>next.config.js</span>
                    </li>
                    <li className="flex items-center gap-2 text-zinc-400 py-1 hover:bg-zinc-900/50 rounded px-2 cursor-pointer transition-colors">
                        <span className="w-4 h-4" />
                        <FileType2 className="w-4 h-4 text-blue-400" />
                        <span>tailwind.config.ts</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

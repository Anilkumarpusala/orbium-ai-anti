"use client"

import { useState } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { Sidebar } from "@/components/layout/Sidebar"
import { PromptArea } from "@/components/build/PromptArea"
import { AgentPanel, AgentStatus } from "@/components/build/AgentPanel"
import { FileTreePreview } from "@/components/build/FileTreePreview"
import { FinalActions } from "@/components/build/FinalActions"

type AppState = "idle" | "generating" | "completed"

export default function BuildPage() {
    const [appState, setAppState] = useState<AppState>("idle")

    const [architectStatus, setArchitectStatus] = useState<AgentStatus>("idle")
    const [developerStatus, setDeveloperStatus] = useState<AgentStatus>("idle")
    const [qaStatus, setQaStatus] = useState<AgentStatus>("idle")

    const handleGenerate = async (prompt: string) => {
        setAppState("generating")

        // Simulate Architect Agent
        setArchitectStatus("running")
        setDeveloperStatus("idle")
        setQaStatus("idle")

        // Mock an api call required by the instructions
        try {
            fetch('/api/generate', {
                method: "POST",
                body: JSON.stringify({ prompt })
            }).catch(e => console.log("Mock API call intent:", e))
        } catch (e) { }

        // Drive the fake UI staging to show the "Alive" experience
        setTimeout(() => {
            setArchitectStatus("completed")
            setDeveloperStatus("running")

            // Simulate Developer Agent
            setTimeout(() => {
                setDeveloperStatus("completed")
                setQaStatus("running")

                // Simulate QA Agent completion
                setTimeout(() => {
                    setQaStatus("completed")
                    setAppState("completed")
                }, 3000)
            }, 4000)
        }, 2500)
    }

    return (
        <div className="flex h-screen bg-[#000000] text-zinc-50 font-sans selection:bg-indigo-500/30 overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 bg-[#000000]">
                <TopBar />

                <main className="flex-1 overflow-y-auto px-8 relative">
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-[0.08] sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
                    </div>

                    <div className="max-w-5xl mx-auto py-12 pb-24 min-h-[calc(100vh-4rem)] flex flex-col justify-start">
                        {appState === "idle" && (
                            <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                                <PromptArea onGenerate={handleGenerate} disabled={false} />
                            </div>
                        )}

                        {(appState === "generating" || appState === "completed") && (
                            <div className="w-full space-y-12">
                                <AgentPanel
                                    architectStatus={architectStatus}
                                    developerStatus={developerStatus}
                                    qaStatus={qaStatus}
                                />

                                {appState === "completed" && (
                                    <div className="space-y-12">
                                        <FileTreePreview />
                                        <FinalActions />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

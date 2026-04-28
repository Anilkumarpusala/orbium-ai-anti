"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  AGENTS, MOCK_TASKS, QUICK_ACTIONS, formatTime,
  type Task, type AgentType,
} from "./types";

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Task["status"] }) {
  const configs = {
    pending: { bg: "#1A1A1A", color: "#888888", label: "pending" },
    running: { bg: "#2A2000", color: "#F59E0B", label: "running" },
    done:    { bg: "#002A12", color: "#22C55E", label: "done" },
    error:   { bg: "#2A0000", color: "#EF4444", label: "error" },
  };
  const c = configs[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "2px 8px", borderRadius: "999px",
      backgroundColor: c.bg, color: c.color,
      fontSize: "11px", fontFamily: "var(--font-jetbrains)",
    }}>
      {status === "running" && (
        <span style={{
          width: "6px", height: "6px", borderRadius: "50%",
          backgroundColor: c.color,
          animation: "pulse 1.2s ease-in-out infinite",
          display: "inline-block",
        }} />
      )}
      {c.label}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function WorkspacePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [activeAgent, setActiveAgent] = useState<AgentType>("scout");
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(MOCK_TASKS[0]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load user + real tasks
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUserEmail(session.user.email ?? "");
      setUserId(session.user.id);

      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setTasks(data as Task[]);
        setSelectedTask(data[0] as Task);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTasks = tasks.filter(t => t.agent_type === activeAgent);
  const agent = AGENTS.find(a => a.id === activeAgent)!;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || !userId) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      user_id: userId,
      agent_type: activeAgent,
      input: input.trim(),
      output: null,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    setSelectedTask(newTask);
    setInput("");

    const { data, error } = await supabase.from("tasks").insert({
      user_id: userId,
      agent_type: newTask.agent_type,
      input: newTask.input,
      status: "pending",
    }).select().single();

    if (!error && data) {
      setTasks(prev => prev.map(t => t.id === newTask.id ? data as Task : t));
      setSelectedTask(data as Task);
    }
  }, [input, userId, activeAgent, supabase]);

  const handleCopy = () => {
    if (selectedTask?.output) {
      navigator.clipboard.writeText(selectedTask.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportCSV = () => {
    if (!selectedTask?.output) return;
    const lines = selectedTask.output.split("\n").filter(l => l.trim());
    const csv = lines.map(l => `"${l.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const mono = "var(--font-jetbrains), monospace";
  const syne = "var(--font-syne), sans-serif";

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#000", overflow: "hidden", position: "relative" }}>

      {/* Pulse keyframe injected via style tag */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
        textarea::placeholder { color: #444; }
      `}</style>

      {/* ── MOBILE OVERLAY ─────────────────────────────────────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 10 }}
        />
      )}

      {/* ── LEFT SIDEBAR ───────────────────────────────────────────────────── */}
      <aside style={{
        width: "240px", minWidth: "240px",
        backgroundColor: "#080808",
        borderRight: "1px solid #1A1A1A",
        display: "flex", flexDirection: "column",
        height: "100vh", overflow: "hidden",
        position: isMobile ? "fixed" : "relative",
        zIndex: isMobile ? 20 : "auto",
        left: isMobile ? (sidebarOpen ? 0 : "-260px") : "auto",
        transition: "left 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #1A1A1A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, #06B6D4, #EC4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: "bold",
            }}>O</div>
            <span style={{ fontFamily: syne, fontWeight: 700, fontSize: "18px", color: "#FFF" }}>Orbium AI</span>
          </div>
        </div>

        {/* My Agents */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 8px" }}>
          <p style={{
            fontFamily: mono, fontSize: "10px", color: "#444",
            textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "0 8px", marginBottom: "8px",
          }}>My Agents</p>

          {AGENTS.map(ag => {
            const isActive = ag.id === activeAgent;
            const hasRunning = tasks.some(t => t.agent_type === ag.id && t.status === "running");
            return (
              <button
                key={ag.id}
                onClick={() => {
                  setActiveAgent(ag.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "6px", cursor: "pointer",
                  backgroundColor: isActive ? "#111" : "transparent",
                  border: "none",
                  borderLeft: isActive ? `3px solid ${ag.color}` : "3px solid transparent",
                  marginBottom: "2px",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                  backgroundColor: hasRunning ? ag.color : ag.dimColor,
                  boxShadow: hasRunning ? `0 0 6px ${ag.color}` : "none",
                  transition: "all 0.3s",
                }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: syne, fontSize: "14px", color: "#FFF", fontWeight: 600 }}>{ag.name}</div>
                  <div style={{ fontFamily: mono, fontSize: "11px", color: "#555" }}>{ag.role}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* New Task Button */}
        <div style={{ padding: "12px 8px" }}>
          <button
            onClick={() => { textareaRef.current?.focus(); if (isMobile) setSidebarOpen(false); }}
            style={{
              width: "100%", padding: "10px", borderRadius: "6px",
              backgroundColor: "#FFF", color: "#000",
              border: "none", cursor: "pointer",
              fontFamily: mono, fontSize: "13px", fontWeight: 600,
            }}
          >+ New Task</button>
        </div>

        {/* User Info */}
        <div style={{ borderTop: "1px solid #1A1A1A", padding: "12px 16px" }}>
          <p style={{ fontFamily: mono, fontSize: "11px", color: "#444", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userEmail}
          </p>
          <button onClick={handleSignOut} style={{
            background: "none", border: "none", color: "#555",
            fontFamily: mono, fontSize: "11px", cursor: "pointer", padding: 0,
          }}>Sign out →</button>
        </div>
      </aside>

      {/* ── CENTER PANEL ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "14px 20px", borderBottom: "1px solid #1A1A1A",
          backgroundColor: "#080808", flexShrink: 0,
        }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(v => !v)}
              style={{ background: "none", border: "none", color: "#FFF", cursor: "pointer", fontSize: "20px", padding: "0 8px 0 0" }}
            >☰</button>
          )}
          <div style={{
            width: "10px", height: "10px", borderRadius: "50%",
            backgroundColor: agent.color, boxShadow: `0 0 8px ${agent.color}`,
          }} />
          <span style={{ fontFamily: syne, fontSize: "15px", color: "#FFF", fontWeight: 600 }}>{agent.name}</span>
          <span style={{ fontFamily: mono, fontSize: "12px", color: "#555" }}>— {agent.role}</span>
        </div>

        {/* Input area */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #111", flexShrink: 0 }}>
          <div style={{
            backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A",
            borderRadius: "8px", overflow: "hidden",
            transition: "border-color 0.2s",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
              placeholder={`What do you need help with?\nTry: @scout find 10 leads for my web design agency in UK`}
              rows={3}
              style={{
                width: "100%", padding: "14px 16px",
                backgroundColor: "transparent", border: "none", outline: "none",
                color: "#FFF", fontFamily: mono, fontSize: "13px",
                lineHeight: "1.6", resize: "none", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", borderTop: "1px solid #111" }}>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: "36px", height: "36px", borderRadius: "6px",
                  backgroundColor: input.trim() ? "#FFF" : "#1A1A1A",
                  color: input.trim() ? "#000" : "#444",
                  border: "none", cursor: input.trim() ? "pointer" : "not-allowed",
                  fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >↑</button>
            </div>
          </div>

          {/* Quick action chips */}
          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
            {QUICK_ACTIONS.map(qa => (
              <button
                key={qa.label}
                onClick={() => { setInput(qa.prompt); textareaRef.current?.focus(); }}
                style={{
                  padding: "5px 12px", borderRadius: "999px",
                  backgroundColor: "#0A0A0A", border: "1px solid #222",
                  color: "#AAA", fontFamily: mono, fontSize: "12px",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#444"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#222"; }}
              >{qa.label}</button>
            ))}
          </div>
        </div>

        {/* Task history */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          <p style={{
            fontFamily: mono, fontSize: "10px", color: "#444",
            textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "8px 8px 4px",
          }}>Task History</p>

          {filteredTasks.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#333", fontFamily: mono, fontSize: "13px" }}>
              No tasks yet. Send one above.
            </div>
          )}

          {filteredTasks.map(task => {
            const ag = AGENTS.find(a => a.id === task.agent_type)!;
            const isSelected = selectedTask?.id === task.id;
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  padding: "10px 12px", borderRadius: "6px", cursor: "pointer",
                  backgroundColor: isSelected ? "#0D0D0D" : "transparent",
                  borderLeft: isSelected ? "3px solid #FFF" : "3px solid transparent",
                  marginBottom: "2px",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#0A0A0A"; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent"; }}
              >
                <div style={{
                  width: "28px", height: "28px", borderRadius: "6px", flexShrink: 0,
                  backgroundColor: ag.dimColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ag.color, fontFamily: syne, fontWeight: 700, fontSize: "12px",
                }}>{ag.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: mono, fontSize: "12px", color: "#DDD",
                    margin: "0 0 4px",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{task.input}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: mono, fontSize: "10px", color: "#444" }}>{formatTime(task.created_at)}</span>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      {!isMobile && (
        <aside style={{
          width: "320px", minWidth: "320px",
          backgroundColor: "#060606",
          borderLeft: "1px solid #1A1A1A",
          display: "flex", flexDirection: "column",
          height: "100vh", overflow: "hidden",
        }}>
          {/* Results header */}
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid #1A1A1A",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          }}>
            <span style={{ fontFamily: syne, fontSize: "14px", color: "#FFF", fontWeight: 600 }}>Results</span>
            {selectedTask?.output && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: "4px 10px", borderRadius: "4px",
                    backgroundColor: "#111", border: "1px solid #222",
                    color: copied ? "#22C55E" : "#888",
                    fontFamily: mono, fontSize: "11px", cursor: "pointer",
                  }}
                >{copied ? "Copied!" : "Copy"}</button>
                {selectedTask.agent_type === "scout" && (
                  <button
                    onClick={handleExportCSV}
                    style={{
                      padding: "4px 10px", borderRadius: "4px",
                      backgroundColor: "#111", border: "1px solid #222",
                      color: "#888", fontFamily: mono, fontSize: "11px", cursor: "pointer",
                    }}
                  >Export CSV</button>
                )}
              </div>
            )}
          </div>

          {/* Results body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {!selectedTask ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", gap: "12px",
              }}>
                <div style={{ fontSize: "32px" }}>⚡</div>
                <p style={{ fontFamily: mono, fontSize: "13px", color: "#333", textAlign: "center" }}>
                  Run a task to see results here
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Agent tag */}
                {(() => {
                  const ag = AGENTS.find(a => a.id === selectedTask.agent_type)!;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        backgroundColor: ag.color, boxShadow: `0 0 6px ${ag.color}`,
                      }} />
                      <span style={{ fontFamily: syne, fontSize: "13px", color: ag.color, fontWeight: 600 }}>{ag.name}</span>
                      <StatusBadge status={selectedTask.status} />
                    </div>
                  );
                })()}

                {/* Task input */}
                <div style={{
                  backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A",
                  borderRadius: "6px", padding: "10px 12px",
                }}>
                  <p style={{ fontFamily: mono, fontSize: "11px", color: "#555", margin: "0 0 4px" }}>Task</p>
                  <p style={{ fontFamily: mono, fontSize: "12px", color: "#AAA", margin: 0, lineHeight: 1.5 }}>
                    {selectedTask.input}
                  </p>
                </div>

                {/* Output */}
                {selectedTask.status === "running" && (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontFamily: mono, fontSize: "12px", color: "#F59E0B" }}>
                      Agent is working…
                    </div>
                    <div style={{
                      display: "inline-block", marginTop: "12px",
                      width: "6px", height: "6px", borderRadius: "50%",
                      backgroundColor: "#F59E0B",
                      animation: "pulse 1.2s ease-in-out infinite",
                    }} />
                  </div>
                )}

                {selectedTask.output && (
                  <div style={{
                    backgroundColor: "#080808", border: "1px solid #1A1A1A",
                    borderRadius: "6px", padding: "12px",
                  }}>
                    <p style={{ fontFamily: mono, fontSize: "11px", color: "#555", margin: "0 0 8px" }}>Output</p>
                    <pre style={{
                      fontFamily: mono, fontSize: "12px", color: "#DDD",
                      margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.7",
                    }}>{selectedTask.output}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

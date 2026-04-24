"use client";

import React from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../hooks/useAuth";

export default function WorkspacePage() {
  const { user } = useAuth();

  const titleStyle = {
    fontFamily: "var(--font-syne)",
    fontSize: "28px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "8px",
  };

  const subtitleStyle = {
    fontFamily: "var(--font-jetbrains)",
    fontSize: "14px",
    color: "#888888",
    marginBottom: "32px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  };

  return (
    <div>
      <h1 style={titleStyle}>Workspace</h1>
      <p style={subtitleStyle}>Manage your agents and tasks.</p>

      <div style={gridStyle}>
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "18px", margin: 0, color: "#FFFFFF" }}>
            Create New Agent
          </h3>
          <p style={{ fontFamily: "var(--font-jetbrains)", fontSize: "14px", color: "#888888", margin: 0 }}>
            Set up a new AI agent to handle your specific tasks.
          </p>
          <Button style={{ alignSelf: "flex-start", marginTop: "auto" }}>
            Create Agent
          </Button>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "18px", margin: 0, color: "#FFFFFF" }}>
            API Keys
          </h3>
          <p style={{ fontFamily: "var(--font-jetbrains)", fontSize: "14px", color: "#888888", margin: 0 }}>
            Manage your API keys for external integrations.
          </p>
          <Button variant="secondary" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
            Manage Keys
          </Button>
        </Card>
        
        <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "18px", margin: 0, color: "#FFFFFF" }}>
            Active Tasks
          </h3>
          <p style={{ fontFamily: "var(--font-jetbrains)", fontSize: "14px", color: "#888888", margin: 0 }}>
            View and monitor your currently running tasks.
          </p>
          <Button variant="outline" style={{ alignSelf: "flex-start", marginTop: "auto" }}>
            View Tasks
          </Button>
        </Card>
      </div>
    </div>
  );
}

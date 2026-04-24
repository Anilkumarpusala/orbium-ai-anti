import React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    
    const containerStyle = {
      display: "flex",
      flexDirection: "column" as const,
      gap: "6px",
      width: "100%",
      marginBottom: "16px",
    };

    const labelStyle = {
      fontSize: "14px",
      color: "#FFFFFF",
      fontFamily: "var(--font-syne)",
    };

    const inputStyle = {
      backgroundColor: "#0A0A0A",
      border: `1px solid ${error ? "#EF4444" : "#1A1A1A"}`,
      borderRadius: "6px",
      padding: "12px 16px",
      color: "#FFFFFF",
      fontFamily: "var(--font-jetbrains)",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.2s ease",
      width: "100%",
      boxSizing: "border-box" as const,
    };

    const errorStyle = {
      fontSize: "12px",
      color: "#EF4444",
      fontFamily: "var(--font-jetbrains)",
    };

    return (
      <div style={containerStyle}>
        {label && <label style={labelStyle}>{label}</label>}
        <input
          ref={ref}
          style={inputStyle}
          className={cn("orbium-input", className)}
          {...props}
        />
        {error && <span style={errorStyle}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

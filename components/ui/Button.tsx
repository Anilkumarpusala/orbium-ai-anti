import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "6px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      cursor: disabled || isLoading ? "not-allowed" : "pointer",
      opacity: disabled || isLoading ? 0.6 : 1,
      border: "none",
      fontFamily: "var(--font-jetbrains)",
    };

    const variantStyles = {
      primary: { backgroundColor: "#FFFFFF", color: "#000000" },
      secondary: { backgroundColor: "#1A1A1A", color: "#FFFFFF" },
      outline: { backgroundColor: "transparent", color: "#FFFFFF", border: "1px solid #1A1A1A" },
      danger: { backgroundColor: "#EF4444", color: "#FFFFFF" },
    };

    const sizeStyles = {
      sm: { padding: "8px 16px", fontSize: "12px" },
      md: { padding: "12px 24px", fontSize: "14px" },
      lg: { padding: "16px 32px", fontSize: "16px" },
    };

    const combinedStyle = {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...(props.style || {}),
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={combinedStyle}
        className={cn("orbium-btn", className)}
        {...props}
      >
        {isLoading ? (
          <span style={{ marginRight: "8px", display: "inline-block", width: "1em", height: "1em", border: "2px solid currentColor", borderRightColor: "transparent", borderRadius: "50%", animation: "spin 0.75s linear infinite" }}></span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

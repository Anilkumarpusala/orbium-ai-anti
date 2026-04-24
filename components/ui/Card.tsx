import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    
    const cardStyle = {
      backgroundColor: "#0A0A0A",
      border: "1px solid #1A1A1A",
      borderRadius: "12px",
      padding: "24px",
      color: "#FFFFFF",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    };

    return (
      <div
        ref={ref}
        style={{ ...cardStyle, ...(props.style || {}) }}
        className={cn("orbium-card", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

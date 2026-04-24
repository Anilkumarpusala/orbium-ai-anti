import React from "react";
import { cn } from "../../lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className, ...props }) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    border: "3px solid rgba(255, 255, 255, 0.2)",
    borderRightColor: "#FFFFFF",
    borderRadius: "50%",
    animation: "spin 0.75s linear infinite",
    display: "inline-block",
  };

  return (
    <div className={cn("orbium-spinner-wrapper", className)} style={{ display: "flex", justifyContent: "center", alignItems: "center" }} {...props}>
      <div style={spinnerStyle}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

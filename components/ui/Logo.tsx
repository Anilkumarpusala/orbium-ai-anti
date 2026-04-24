import React from "react";
import { cn } from "../../lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("orbium-logo", className)}
      style={{ display: "inline-block" }}
      {...props}
    >
      <circle cx="16" cy="16" r="14" stroke="#FFFFFF" strokeWidth="4" />
      <circle cx="16" cy="16" r="6" fill="#FFFFFF" />
    </svg>
  );
};

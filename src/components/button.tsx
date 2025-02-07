"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "tertiary";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export default function Button({ children, className, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${className} font-mono flex items-center justify-center text-xs px-2 py-1 bg-button hover:bg-button-hover transition-colors duration-300 relative group`}
    >
      {children}
    </button>
  );
}

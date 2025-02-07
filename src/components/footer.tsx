"use client";

import React from "react";
import Button from "./button";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  useKeyboardShortcuts();

  return (
    <>
      <footer className="flex text-sm justify-between mt-20">
        <p className="font-mono">© {currentYear} prani.dev</p>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open("https://github.com/pranith", "_blank")}
          >
            {"[G] GITHUB"}
          </Button>
          <Button
            onClick={() =>
              window.open("https://linkedin.com/in/pranith", "_blank")
            }
          >
            {"[L] LINKEDIN"}
          </Button>
          <Button
            onClick={() =>
              window.open("https://instagram.com/pranith", "_blank")
            }
          >
            {"[I] INSTAGRAM"}
          </Button>
          <Button
            onClick={() => window.open("https://x.com/pranith", "_blank")}
          >
            {"[X] X.COM"}
          </Button>
          <Button
            onClick={() => window.open("mailto:pranith@example.com", "_blank")}
          >
            {"[M] EMAIL"}
          </Button>
        </div>
      </footer>
    </>
  );
}

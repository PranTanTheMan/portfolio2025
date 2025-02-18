"use client";

import React from "react";
import Button from "./button";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";

export default function Footer({ className }: { className?: string }) {
  const currentYear = new Date().getFullYear();
  useKeyboardShortcuts();

  return (
    <>
      <footer
        className={`flex text-sm justify-between items-center flex-col lg:flex-row ${
          className || ""
        }`}
      >
        <p className="font-mono lg:mb-0 mb-4">© {currentYear} prani.dev</p>
        <div className="flex lg:flex-row flex-col gap-2">
          <Button
            onClick={() =>
              window.open("https://github.com/prantantheman", "_blank")
            }
          >
            {"[G] GITHUB"}
          </Button>
          <Button
            onClick={() =>
              window.open(
                "https://linkedin.com/in/pranith-molakalapalli",
                "_blank"
              )
            }
          >
            {"[L] LINKEDIN"}
          </Button>
          <Button
            onClick={() =>
              window.open("https://instagram.com/itsyaboipranith", "_blank")
            }
          >
            {"[I] INSTAGRAM"}
          </Button>
          <Button
            onClick={() => window.open("https://x.com/prantantheman", "_blank")}
          >
            {"[X] X.COM"}
          </Button>
          <Button
            onClick={() =>
              window.open("mailto:seriousbro23@gmail.com", "_blank")
            }
          >
            {"[M] EMAIL"}
          </Button>
        </div>
      </footer>
    </>
  );
}

"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/button";
import { useKeyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { Link } from "next-view-transitions";

export default function Nav() {
  useKeyboardShortcuts();

  return (
    <>
      <nav className="flex justify-between mb-20">
        <div className="flex justify-between w-full items-center gap-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hover:scale-105 transition-all duration-200 active:scale-95"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src="/Pranith.webp" alt="@Pranith" />
                <AvatarFallback>PM</AvatarFallback>
              </Avatar>
            </Link>
            <p className="font-mono text-sm lg:block hidden">{"[P]"}</p>
          </div>
          <div className="font-normal flex gap-2 tracking-wider">
            <Link target="_self" href="/sign">
              <Button>{"[S] SIGN MY PAGE"}</Button>
            </Link>
            <Link target="_self" href="/data">
              <Button>{"[D] DATA"}</Button>
            </Link>
            <Link target="_blank" href="/prani-mola-resume.pdf">
              <Button>{"[R] RESUME"}</Button>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

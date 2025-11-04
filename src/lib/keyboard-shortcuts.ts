"use client";
import { useEffect } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Howl } from "howler";

type ShortcutAction = {
  action: () => void;
  description: string;
};

type ShortcutMap = {
  [key: string]: ShortcutAction;
};

const createDefaultShortcuts = (
  router: ReturnType<typeof useTransitionRouter>,
): ShortcutMap => ({
  g: {
    action: () => window.open("https://github.com/prantantheman", "_blank"),
    description: "Open GitHub",
  },
  l: {
    action: () =>
      window.open("https://linkedin.com/in/pranith-molakalapalli", "_blank"),
    description: "Open LinkedIn",
  },
  i: {
    action: () =>
      window.open("https://instagram.com/itsyaboipranith", "_blank"),
    description: "Open Instagram",
  },
  x: {
    action: () => window.open("https://x.com/prantantheman", "_blank"),
    description: "Open X.com",
  },
  m: {
    action: () => window.open("mailto:pmolakal@asu.edu", "_blank"),
    description: "Open Email",
  },
  // s: {
  //   action: () => router.push("/sign"),
  //   description: "Go to Sign My Page",
  // },
  d: {
    action: () => router.push("/data"),
    description: "Go to Data",
  },
  r: {
    action: () => window.open("/Resume.pdf", "_blank"),
    description: "Open Resume",
  },
  p: {
    action: () => router.push("/"),
    description: "Go to Home",
  },
});

const shortcutSound = new Howl({
  src: ["/plucked-hit-high.wav"],
  volume: 0.5,
});

export function useKeyboardShortcuts(shortcuts?: ShortcutMap) {
  const router = useTransitionRouter();
  const defaultShortcuts = createDefaultShortcuts(router);
  const finalShortcuts = shortcuts || defaultShortcuts;

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      // Ignore if user is typing in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ignore if any modifier keys are pressed (Ctrl, Alt, Meta/Command, Shift)
      if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
        return;
      }

      const key = event.key.toLowerCase();
      const shortcut = finalShortcuts[key];

      if (shortcut) {
        event.preventDefault();
        shortcutSound.play();
        shortcut.action();
      }
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [finalShortcuts, router]);
}

export function getShortcutFromText(text: string): string | null {
  const match = text.match(/\[(.)\]/);
  return match ? match[1].toLowerCase() : null;
}

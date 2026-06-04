import { useEffect } from "react";

/**
 * On phones, when an input/textarea near the bottom of the screen is focused, the
 * on-screen keyboard can cover it. This nudges the page so the focused field stays
 * visible above the keyboard. No-op on desktop (>=768px) so desktop behaviour is
 * unchanged.
 */
export function useKeyboardScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return; // mobile only

    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA")) return;
      // Wait for the keyboard to animate in, then keep the field visible.
      setTimeout(() => {
        const rect = t.getBoundingClientRect();
        const vh = window.visualViewport?.height ?? window.innerHeight;
        const keyboardSafe = vh - 280; // assume ~280px keyboard
        if (rect.bottom > keyboardSafe) {
          window.scrollBy({ top: rect.bottom - keyboardSafe + 20, behavior: "smooth" });
        }
      }, 350);
    };

    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, []);
}

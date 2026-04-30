"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function MobileMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function close() {
      if (ref.current?.open) ref.current.open = false;
    }

    function onPointerDown(e: PointerEvent) {
      const el = ref.current;
      if (!el || !el.open) return;
      const target = e.target as Element | null;
      if (!target) return;

      // Click outside the menu — close.
      if (!el.contains(target)) {
        close();
        return;
      }

      // Click inside on a link or non-toggle button — close after the action.
      const isAction = target.closest("a, button");
      const isToggle = target.closest("summary");
      if (isAction && !isToggle) {
        close();
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={ref} className="topbar-menu">
      {children}
    </details>
  );
}

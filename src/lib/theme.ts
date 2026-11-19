import { useEffect } from "react";
import type { ThemeMode } from "./store.ts";

/** Pantone Cloud Dancer: the Light theme background. Never pure white. */
export const CLOUD_DANCER = "#F0EEE9";
const DARK_BG = "#070B12";

/** Puts data-theme="light" or "dark" on <html> and keeps the browser chrome color in step. */
export function useApplyTheme(mode: ThemeMode) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const apply = () => {
      const light = mode === "light" || (mode === "auto" && media.matches);
      document.documentElement.dataset.theme = light ? "light" : "dark";
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", light ? CLOUD_DANCER : DARK_BG);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mode]);
}

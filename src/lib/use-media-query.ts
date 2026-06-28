"use client";

import { useSyncExternalStore } from "react";

function subscribeMediaQuery(query: string, onChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getMediaQuerySnapshot(query: string) {
  return window.matchMedia(query).matches;
}

/** Tailwind `md` breakpoint (768px). */
export function useIsMdUp() {
  return useSyncExternalStore(
    (onChange) => subscribeMediaQuery("(min-width: 768px)", onChange),
    () => getMediaQuerySnapshot("(min-width: 768px)"),
    () => false,
  );
}

/** Tailwind `xl` breakpoint (1280px). */
export function useIsXlUp() {
  return useSyncExternalStore(
    (onChange) => subscribeMediaQuery("(min-width: 1280px)", onChange),
    () => getMediaQuerySnapshot("(min-width: 1280px)"),
    () => false,
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 10;

/** Oculta la barra al bajar y la muestra al subir. */
export function useScrollHideBar() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current + SCROLL_THRESHOLD) {
        setVisible(false);
      } else if (currentScrollY < lastScrollY.current - SCROLL_THRESHOLD) {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return visible;
}

export function scrollToElement(
  element: HTMLElement | null,
  offset = 96,
) {
  if (!element) return;

  const top =
    element.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  });
}

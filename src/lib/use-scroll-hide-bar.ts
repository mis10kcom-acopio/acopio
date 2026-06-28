"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 10;
const DESKTOP_MIN_WIDTH = 768;

/** Oculta la barra al bajar y la muestra al subir (solo móvil). */
export function useScrollHideBar() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
        setVisible(true);
        return;
      }

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

    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
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

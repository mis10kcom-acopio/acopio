"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SCROLL_THRESHOLD = 10;

type ScrollChromeContextValue = {
  /** true = filtros visibles arriba, footer oculto */
  filtersRevealed: boolean;
};

const ScrollChromeContext = createContext<ScrollChromeContextValue>({
  filtersRevealed: true,
});

export function ScrollChromeProvider({ children }: { children: ReactNode }) {
  const [filtersRevealed, setFiltersRevealed] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setFiltersRevealed(true);
      } else if (currentScrollY > lastScrollY.current + SCROLL_THRESHOLD) {
        setFiltersRevealed(false);
      } else if (currentScrollY < lastScrollY.current - SCROLL_THRESHOLD) {
        setFiltersRevealed(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <ScrollChromeContext.Provider value={{ filtersRevealed }}>
      {children}
    </ScrollChromeContext.Provider>
  );
}

export function useScrollChrome() {
  return useContext(ScrollChromeContext);
}

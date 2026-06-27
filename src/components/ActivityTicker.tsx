"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActivityItem } from "@/lib/activity-ticker";
import { formatRelativeTime } from "@/lib/relative-time";

const ROTATE_MS = 5000;
const FADE_MS = 500;

const FALLBACK_MESSAGE =
  "⚡ Última actividad: Plataforma en línea — reportes en tiempo real";

function buildActivityMessage(item: ActivityItem): string {
  const verbo = item.genero === "a" ? "reportada" : "reportado";
  const tiempo = formatRelativeTime(item.creado_el);
  return `⚡ Última actividad: ${item.tipo} ${verbo} ${tiempo}`;
}

export function ActivityTicker({ items }: { items: ActivityItem[] }) {
  const [timeTick, setTimeTick] = useState(0);

  const messages = useMemo(
    () =>
      items.length > 0
        ? items.map(buildActivityMessage)
        : [FALLBACK_MESSAGE],
    [items, timeTick],
  );

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeInterval = window.setInterval(() => {
      setTimeTick((tick) => tick + 1);
    }, 60_000);
    return () => window.clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;

    const rotateInterval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % messages.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);

    return () => window.clearInterval(rotateInterval);
  }, [messages.length]);

  useEffect(() => {
    setIndex(0);
  }, [messages.length]);

  const message = messages[index] ?? FALLBACK_MESSAGE;

  return (
    <div
      className="w-full border-b border-slate-800 bg-slate-900 px-4 py-1.5 text-center text-sm text-slate-100"
      role="status"
      aria-live="polite"
    >
      <p
        className={`mx-auto max-w-6xl truncate transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {message}
      </p>
    </div>
  );
}

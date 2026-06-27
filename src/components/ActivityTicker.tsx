"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActivityItem } from "@/lib/activity-ticker";
import { formatRelativeTime } from "@/lib/relative-time";

const ROTATE_MS = 18000;

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

  useEffect(() => {
    const timeInterval = window.setInterval(() => {
      setTimeTick((tick) => tick + 1);
    }, 60_000);
    return () => window.clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;

    const rotateInterval = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, ROTATE_MS);

    return () => window.clearInterval(rotateInterval);
  }, [messages.length]);

  useEffect(() => {
    setIndex(0);
  }, [messages.length]);

  const message = messages[index] ?? FALLBACK_MESSAGE;

  return (
    <div
      className="sticky top-0 z-50 w-full overflow-hidden border-b border-slate-800 bg-slate-900 py-2 text-base text-slate-100"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto max-w-6xl overflow-hidden">
        <p
          key={`${index}-${message}`}
          className="activity-ticker-marquee inline-block whitespace-nowrap px-4 text-slate-100"
        >
          {message}
        </p>
      </div>
    </div>
  );
}

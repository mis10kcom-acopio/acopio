"use client";

import { useEffect, useState } from "react";

function formatVenezuelaTime(date: Date): string {
  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function VenezuelaLocalClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function updateTime() {
      setTime(formatVenezuelaTime(new Date()));
    }

    updateTime();
    const intervalId = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (!time) {
    return null;
  }

  return (
    <p
      className="mb-5 rounded-xl border border-amber-200/80 bg-white/80 px-4 py-2.5 text-center text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-sm"
      aria-live="polite"
    >
      Hora local: {time} 🇻🇪
    </p>
  );
}

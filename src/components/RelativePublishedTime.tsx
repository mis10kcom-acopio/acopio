"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/relative-time";

export function RelativePublishedTime({ date }: { date: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function updateLabel() {
      setLabel(formatRelativeTime(date));
    }

    updateLabel();
    const intervalId = window.setInterval(updateLabel, 60_000);
    return () => window.clearInterval(intervalId);
  }, [date]);

  if (!label) {
    return null;
  }

  return (
    <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
      <Clock className="h-3 w-3 shrink-0" aria-hidden />
      <time dateTime={date}>{label}</time>
    </span>
  );
}

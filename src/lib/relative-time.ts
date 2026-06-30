export const VENEZUELA_TIME_ZONE = "America/Caracas";

const relativeTimeFormatter = new Intl.RelativeTimeFormat("es-VE", {
  numeric: "auto",
});

function capitalizeSpanish(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getZonedYmd(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  };
}

function calendarDayDiff(from: Date, to: Date, timeZone: string): number {
  const fromYmd = getZonedYmd(from, timeZone);
  const toYmd = getZonedYmd(to, timeZone);
  const fromUtc = Date.UTC(fromYmd.year, fromYmd.month - 1, fromYmd.day);
  const toUtc = Date.UTC(toYmd.year, toYmd.month - 1, toYmd.day);
  return Math.round((fromUtc - toUtc) / (60 * 60 * 24 * 1000));
}

function calendarMonthDiff(from: Date, to: Date, timeZone: string): number {
  const fromYmd = getZonedYmd(from, timeZone);
  const toYmd = getZonedYmd(to, timeZone);
  return (
    (fromYmd.year - toYmd.year) * 12 + (fromYmd.month - toYmd.month)
  );
}

function calendarYearDiff(from: Date, to: Date, timeZone: string): number {
  return getZonedYmd(from, timeZone).year - getZonedYmd(to, timeZone).year;
}

export function formatRelativeTime(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 60) {
    return capitalizeSpanish(relativeTimeFormatter.format(diffSeconds, "second"));
  }

  if (absSeconds < 60 * 60) {
    const value = Math.round(diffSeconds / 60);
    return capitalizeSpanish(relativeTimeFormatter.format(value, "minute"));
  }

  if (absSeconds < 60 * 60 * 24) {
    const value = Math.round(diffSeconds / (60 * 60));
    return capitalizeSpanish(relativeTimeFormatter.format(value, "hour"));
  }

  const dayDiff = calendarDayDiff(date, now, VENEZUELA_TIME_ZONE);
  if (Math.abs(dayDiff) < 7) {
    return capitalizeSpanish(relativeTimeFormatter.format(dayDiff, "day"));
  }

  const weekDiff = Math.round(dayDiff / 7);
  if (Math.abs(weekDiff) < 5) {
    return capitalizeSpanish(relativeTimeFormatter.format(weekDiff, "week"));
  }

  const monthDiff = calendarMonthDiff(date, now, VENEZUELA_TIME_ZONE);
  if (Math.abs(monthDiff) < 12) {
    return capitalizeSpanish(relativeTimeFormatter.format(monthDiff, "month"));
  }

  const yearDiff = calendarYearDiff(date, now, VENEZUELA_TIME_ZONE);
  return capitalizeSpanish(relativeTimeFormatter.format(yearDiff, "year"));
}

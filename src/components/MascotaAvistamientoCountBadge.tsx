import { formatAvistamientoCount } from "@/lib/avistamientos";

export function MascotaAvistamientoCountBadge({
  count = 0,
  size = "default",
  className = "",
}: {
  count?: number;
  size?: "default" | "compact";
  className?: string;
}) {
  const isCompact = size === "compact";
  const label = formatAvistamientoCount(count);

  return (
    <p
      className={`inline-flex items-center gap-1 font-medium text-zinc-600 ${
        isCompact
          ? "text-[10px] leading-tight"
          : "text-xs sm:text-sm"
      } ${className}`}
      aria-label={label}
    >
      <span aria-hidden>💬</span>
      <span>{label}</span>
    </p>
  );
}

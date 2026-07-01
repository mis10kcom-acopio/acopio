import { PawPrint } from "lucide-react";

export function MascotaFotoPlaceholder({
  className = "",
  iconClassName = "h-16 w-16",
}: {
  className?: string;
  iconClassName?: string;
}) {
  const isFixedSize = /\bh-\d+\b/.test(className) || /\bw-\d+\b/.test(className);

  return (
    <div
      className={`flex items-center justify-center bg-amber-50 text-amber-600 ${
        isFixedSize ? "" : "aspect-square w-full"
      } ${className}`}
      aria-hidden
    >
      <PawPrint className={iconClassName} />
    </div>
  );
}

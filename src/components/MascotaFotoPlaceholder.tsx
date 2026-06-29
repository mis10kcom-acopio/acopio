import { PawPrint } from "lucide-react";

export function MascotaFotoPlaceholder({
  className = "",
  iconClassName = "h-16 w-16",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={`flex aspect-square w-full items-center justify-center bg-amber-50 text-amber-600 ${className}`}
      aria-hidden
    >
      <PawPrint className={iconClassName} />
    </div>
  );
}

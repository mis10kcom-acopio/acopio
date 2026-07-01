"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function MascotaDetailCloseButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="absolute top-3 right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70"
      aria-label="Cerrar y volver"
    >
      <X className="h-6 w-6" strokeWidth={2.5} aria-hidden />
    </button>
  );
}

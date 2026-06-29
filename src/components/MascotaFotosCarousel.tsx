"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { MascotaFotoPlaceholder } from "@/components/MascotaFotoPlaceholder";

export function MascotaFotosCarousel({
  fotos,
  alt,
  className = "",
  imageClassName = "aspect-square w-full object-cover",
  sizes = "(max-width: 768px) 100vw, 720px",
  priority = false,
  stopLinkNavigation = false,
}: {
  fotos: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  stopLinkNavigation?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const safeIndex = fotos.length > 0 ? Math.min(index, fotos.length - 1) : 0;
  const hasMultiple = fotos.length > 1;

  if (fotos.length === 0) {
    return <MascotaFotoPlaceholder className={className} />;
  }

  function handleNav(
    event: React.MouseEvent<HTMLButtonElement>,
    direction: "prev" | "next",
  ) {
    if (stopLinkNavigation) {
      event.preventDefault();
      event.stopPropagation();
    }

    setIndex((current) => {
      const base = Math.min(current, fotos.length - 1);
      if (direction === "prev") {
        return base === 0 ? fotos.length - 1 : base - 1;
      }
      return base === fotos.length - 1 ? 0 : base + 1;
    });
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={fotos[safeIndex]}
        alt={alt}
        width={900}
        height={900}
        crossOrigin="anonymous"
        className={imageClassName}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={sizes}
      />

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={(event) => handleNav(event, "prev")}
            className="absolute top-1/2 left-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-black/45 text-white shadow-md transition hover:bg-black/60"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={(event) => handleNav(event, "next")}
            className="absolute top-1/2 right-2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-black/45 text-white shadow-md transition hover:bg-black/60"
            aria-label="Foto siguiente"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <span className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-semibold text-white">
            {safeIndex + 1}/{fotos.length}
          </span>
        </>
      ) : null}
    </div>
  );
}

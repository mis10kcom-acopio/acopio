"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const labelClassName = "mb-1.5 block text-sm font-semibold text-zinc-800";

export function FotoFileFieldWithPreview({
  label,
  name,
  accept = "image/*",
  capture,
  hint,
  required = false,
}: {
  label: string;
  name: string;
  accept?: string;
  capture?: "user" | "environment";
  hint?: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      setPreviewUrl(null);
      setFileName(null);
      return;
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);
    setFileName(file.name);
  }

  return (
    <div>
      <p className={labelClassName}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </p>

      {previewUrl ? (
        <div className="mb-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          <Image
            src={previewUrl}
            alt="Vista previa de la foto seleccionada"
            width={320}
            height={320}
            unoptimized
            className="aspect-square w-full max-w-[12rem] object-cover"
          />
          {fileName ? (
            <p className="border-t border-zinc-200 px-3 py-2 text-xs text-zinc-600">
              {fileName}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mb-3 text-sm text-zinc-500">Sin foto seleccionada.</p>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
      >
        {previewUrl ? "Cambiar foto" : "Elegir foto"}
      </button>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept}
        capture={capture}
        required={required}
        className="sr-only"
        onChange={handleChange}
      />

      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

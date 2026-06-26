"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-3 w-full rounded-lg border border-amber-300 bg-amber-100 px-4 py-2.5 text-sm font-medium text-amber-900 transition hover:bg-amber-200"
    >
      {copied ? "¡Copiado al portapapeles!" : "Copiar enlace"}
    </button>
  );
}

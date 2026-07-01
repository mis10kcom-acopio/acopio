"use client";

import { SupportFooterLinks } from "@/components/SupportFooterLinks";
import { useScrollHideBar } from "@/lib/use-scroll-hide-bar";

export function FixedSupportBar() {
  const visible = useScrollHideBar();

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-zinc-50 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] transition-transform duration-300 ease ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="contentinfo"
      aria-label="Soporte por WhatsApp"
      aria-hidden={!visible}
    >
      <div className="mx-auto max-w-6xl">
        <SupportFooterLinks tabIndex={visible ? 0 : -1} />
      </div>
    </div>
  );
}

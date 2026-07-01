import Image from "next/image";
import { FixedSupportBar } from "@/components/FixedSupportBar";
import { SupportFooterLinks } from "@/components/SupportFooterLinks";

export { FIXED_SUPPORT_BAR_PADDING } from "@/lib/support-footer-constants";

export function StaticSupportFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <div className="text-center">
          <Image
            src="/logohuellas.png"
            alt="Huellas a Salvo"
            width={48}
            height={48}
            className="mx-auto h-12 w-12 object-contain"
          />
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
            Hecho con amor para ayudar a los animales afectados por el terremoto
          </p>
        </div>
        <SupportFooterLinks />
      </div>
    </footer>
  );
}

export function SupportFooter() {
  return (
    <>
      <StaticSupportFooter />
      <FixedSupportBar />
    </>
  );
}

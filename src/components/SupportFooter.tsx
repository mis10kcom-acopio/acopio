import Image from "next/image";
import { FixedSupportBar } from "@/components/FixedSupportBar";
import { FIXED_SUPPORT_BAR_PADDING } from "@/lib/support-footer-constants";

export { FIXED_SUPPORT_BAR_PADDING } from "@/lib/support-footer-constants";

export function SupportFooter() {
  return (
    <>
      <footer
        className={`mt-auto border-t border-amber-200/80 bg-white ${FIXED_SUPPORT_BAR_PADDING}`}
      >
        <div className="px-4 py-8 sm:py-10">
          <Image
            src="/logohuellas.png"
            alt="Huellas a Salvo"
            width={48}
            height={48}
            className="mx-auto h-12 w-12 object-contain"
          />
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-gray-500">
            Hecho con amor para ayudar a los animales afectados por el terremoto
          </p>
        </div>
      </footer>

      <FixedSupportBar />
    </>
  );
}

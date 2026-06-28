import Link from "next/link";

export function ImplicitConsentNotice() {
  return (
    <p className="text-center text-xs text-gray-500">
      Al publicar este reporte, aceptas nuestros{" "}
      <Link href="/terminos" className="underline hover:text-gray-600">
        Términos y Privacidad
      </Link>
    </p>
  );
}

import Link from "next/link";

export function ImplicitConsentNotice() {
  return (
    <p className="text-center text-xs text-gray-500">
      Al publicar este reporte, aceptas nuestros{" "}
      <Link
        href="/terminos"
        className="font-semibold text-red-600 underline hover:text-red-700"
      >
        Términos y Privacidad
      </Link>
    </p>
  );
}

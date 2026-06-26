import Link from "next/link";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { buildEditUrl, getSiteBaseUrl } from "@/lib/site";

interface ExitoPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ExitoPage({ searchParams }: ExitoPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-amber-50 px-4">
        <div className="max-w-md text-center">
          <p className="text-lg font-medium text-red-700">
            No se encontró el enlace de edición.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-amber-800 hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const baseUrl = await getSiteBaseUrl();
  const editUrl = buildEditUrl(baseUrl, token);

  return (
    <main className="flex min-h-screen items-center justify-center bg-amber-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="text-5xl" aria-hidden>
            ✅
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl">
            ¡Registro exitoso!
          </h1>
          <p className="mt-4 text-base text-zinc-600">
            Guarda este enlace, es tu llave secreta para actualizar el estado más
            adelante. No lo compartas públicamente.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Tu enlace de edición
          </p>
          <a
            href={editUrl}
            className="mt-2 block break-all text-sm font-medium text-amber-900 underline decoration-amber-400 underline-offset-2"
          >
            {editUrl}
          </a>
          <CopyLinkButton url={editUrl} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={editUrl}
            className="flex-1 rounded-xl bg-amber-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Ir a mi panel de edición
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Ver listado público
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarPorToken } from "@/actions/editar";
import {
  EditarAcopioPanel,
  EditarMascotaPanel,
  EditarVoluntarioPanel,
} from "@/components/forms/EditarPanels";
import { FormShell } from "@/components/forms/FormShell";

interface EditarPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ ok?: string }>;
}

export default async function EditarPage({
  params,
  searchParams,
}: EditarPageProps) {
  const { token } = await params;
  const { ok } = await searchParams;

  if (!token?.trim()) {
    notFound();
  }

  let registro;
  try {
    registro = await buscarPorToken(token);
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center bg-amber-50 px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-800">
            No se pudo conectar con la base de datos. Verifica la configuración
            del servidor.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-amber-800 hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (!registro) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-amber-50 px-4">
        <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <span className="text-4xl" aria-hidden>
            🔒
          </span>
          <h1 className="mt-4 text-xl font-bold text-zinc-900">
            Enlace no válido
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Este enlace de edición no existe o fue eliminado. Usa el enlace
            completo que recibiste al registrarte (o el ID/token de tu reporte).
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Ir al inicio
          </Link>
        </div>
      </main>
    );
  }

  const successMessage = ok ? decodeURIComponent(ok) : null;

  const titles = {
    mascota: "Gestionar reporte de mascota",
    voluntario: "Gestionar disponibilidad",
    acopio: "Actualizar stock del acopio",
  };

  const descriptions = {
    mascota:
      "Corrige los datos de tu reporte y actualiza el estado cuando corresponda.",
    voluntario:
      "Edita tu información de contacto y gestiona tu disponibilidad.",
    acopio: "Actualiza los datos del centro y el nivel de stock de insumos.",
  };

  return (
    <FormShell
      title={titles[registro.tipo]}
      description={descriptions[registro.tipo]}
    >
      {registro.tipo === "mascota" && (
        <EditarMascotaPanel
          identificador={token}
          registro={registro.registro}
          successMessage={successMessage}
        />
      )}
      {registro.tipo === "voluntario" && (
        <EditarVoluntarioPanel
          identificador={token}
          registro={registro.registro}
          successMessage={successMessage}
        />
      )}
      {registro.tipo === "acopio" && (
        <EditarAcopioPanel
          identificador={token}
          registro={registro.registro}
          successMessage={successMessage}
        />
      )}
    </FormShell>
  );
}

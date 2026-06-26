import type { Metadata } from "next";
import { FormShell } from "@/components/forms/FormShell";
import { AcopioRegistroForm } from "@/components/forms/RegistroForms";

export const metadata: Metadata = {
  title: "Registro de acopio — Huellas a Salvo",
  description: "Registra un centro de acopio de insumos para mascotas.",
};

export default function RegistroAcopioPage() {
  return (
    <FormShell
      title="Registrar centro de acopio"
      description="Indica dónde se reciben donaciones y qué necesitas con urgencia. Podrás actualizar el stock con tu enlace secreto."
    >
      <AcopioRegistroForm />
    </FormShell>
  );
}

import type { Metadata } from "next";
import { FormShell } from "@/components/forms/FormShell";
import { MascotaRegistroForm } from "@/components/forms/RegistroForms";

export const metadata: Metadata = {
  title: "Reportar mascota — Huellas a Salvo",
  description: "Reporta una mascota perdida o encontrada en Venezuela.",
};

export default function ReportarMascotaPage() {
  return (
    <FormShell
      title="Reportar mascota"
      description="Publica un aviso de mascota perdida o encontrada. Al finalizar recibirás un enlace secreto para actualizar el estado."
    >
      <MascotaRegistroForm />
    </FormShell>
  );
}

import type { Metadata } from "next";
import { FormShell } from "@/components/forms/FormShell";
import { VoluntarioRegistroForm } from "@/components/forms/RegistroForms";

export const metadata: Metadata = {
  title: "Registro de voluntario — Huellas a Salvo",
  description:
    "Únete a la red de veterinarios, hogares temporales y rescatistas.",
};

export default function RegistroVoluntarioPage() {
  return (
    <FormShell
      title="Registro de voluntario"
      description="Ofrece ayuda como veterinario, hogar temporal, rescatista o transporte. Recibirás un enlace para gestionar tu disponibilidad."
    >
      <VoluntarioRegistroForm />
    </FormShell>
  );
}

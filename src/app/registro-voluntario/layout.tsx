import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro de voluntario — Huellas a Salvo",
  description:
    "Únete a la red de veterinarios, hogares temporales y rescatistas.",
};

export default function RegistroVoluntarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

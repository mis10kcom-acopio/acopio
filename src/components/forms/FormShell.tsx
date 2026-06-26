import Link from "next/link";

interface FormShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function FormShell({
  title,
  description,
  children,
  backHref = "/",
  backLabel = "← Volver al inicio",
}: FormShellProps) {
  return (
    <main className="min-h-screen bg-amber-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <Link
          href={backHref}
          className="mb-6 inline-block text-sm font-medium text-amber-800 hover:text-amber-900"
        >
          {backLabel}
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              🐾
            </span>
            <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
          </div>
          <p className="mt-2 text-sm text-zinc-600">{description}</p>
        </header>

        {children}
      </div>
    </main>
  );
}

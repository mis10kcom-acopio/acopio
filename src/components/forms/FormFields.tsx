"use client";

import { useFormStatus } from "react-dom";

const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

const labelClassName = "block text-sm font-medium text-zinc-700";

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  hint,
  as = "input",
  rows = 4,
  children,
  onSelectChange,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  as?: "input" | "textarea" | "select";
  rows?: number;
  children?: React.ReactNode;
  onSelectChange?: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClassName}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={inputClassName}
        />
      ) : as === "select" ? (
        <select
          id={name}
          name={name}
          required={required}
          className={inputClassName}
          defaultValue=""
          onChange={(event) => onSelectChange?.(event.target.value)}
        >
          {children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className={inputClassName}
          inputMode={type === "tel" ? "tel" : undefined}
        />
      )}
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function FormFileField({
  label,
  name,
  accept = "image/*",
  capture,
  hint,
  required = false,
}: {
  label: string;
  name: string;
  accept?: string;
  capture?: "user" | "environment";
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelClassName}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        capture={capture}
        required={required}
        className={`${inputClassName} file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-900`}
      />
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {message}
    </div>
  );
}

export function FormSuccess({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
      role="status"
    >
      {message}
    </div>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "Enviando…",
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "danger" | "warning" | "success";
}) {
  const { pending } = useFormStatus();

  const variants = {
    primary: "bg-amber-600 hover:bg-amber-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-xl px-4 py-3.5 text-base font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function ActionForm({
  action,
  children,
  className = "space-y-5",
  encType,
}: {
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  encType?: "multipart/form-data";
}) {
  return (
    <form action={action} className={className} encType={encType}>
      {children}
    </form>
  );
}

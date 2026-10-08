import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function authInputClasses(hasError: boolean): string {
  return cn(
    "h-11 w-full rounded-xl border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60",
    hasError
      ? "border-error focus:border-error"
      : "border-border focus:border-primary",
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-xs text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-sm text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FormAlertProps = {
  variant: "error" | "success" | "info";
  children: ReactNode;
};

export function FormAlert({ variant, children }: FormAlertProps) {
  const styles = {
    error: "border-error/40 bg-error/10 text-error",
    success: "border-primary/40 bg-primary-soft text-accent",
    info: "border-border bg-surface-raised text-subtle",
  } as const;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("rounded-xl border px-4 py-3 text-sm", styles[variant])}
    >
      {children}
    </div>
  );
}

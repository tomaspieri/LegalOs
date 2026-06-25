import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-[var(--radius-md)]",
            "bg-[var(--color-surface)] border border-[var(--color-border)]",
            "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent",
            error && "border-[var(--color-danger)] focus:ring-[var(--color-danger)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

import { forwardRef, type InputHTMLAttributes } from "react";
import { FormError } from "./form-error";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput({ label, error, id, className, ...props }, ref) {
    const inputId = id ?? props.name;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`h-10 rounded-sm border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${
            error
              ? "border-danger focus-visible:border-danger"
              : "border-border focus-visible:border-border-strong"
          } ${className ?? ""}`}
          {...props}
        />
        <FormError id={errorId} message={error} />
      </div>
    );
  },
);

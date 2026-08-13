import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

interface AuthCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

// Accessible styled checkbox: a visually-hidden native input paired with a
// custom check icon, supporting an arbitrary React node as its label.
export const AuthCheckbox = forwardRef<HTMLInputElement, AuthCheckboxProps>(
  function AuthCheckbox({ label, id, className, ...props }, ref) {
    const inputId = id ?? props.name;

    return (
      <label
        htmlFor={inputId}
        className="group relative flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground"
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={`peer absolute left-0 top-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-[3px] border border-border bg-muted transition-colors checked:border-primary group-hover:border-border-strong ${className ?? ""}`}
          {...props}
        />
        <Check
          className="pointer-events-none absolute left-0 top-0.5 size-4 shrink-0 p-[2px] text-primary opacity-0 transition-opacity peer-checked:opacity-100"
          aria-hidden="true"
        />
        <span className="pl-[26px] leading-snug">{label}</span>
      </label>
    );
  },
);

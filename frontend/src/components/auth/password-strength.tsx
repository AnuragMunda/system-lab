import { Check, X } from "lucide-react";

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];
}

function getStrengthLevel(requirements: PasswordRequirement[], hasInput: boolean) {
  if (!hasInput) return 0;
  return requirements.filter((r) => r.met).length;
}

const STRENGTH_META = [
  { label: "Too weak", color: "bg-danger" },
  { label: "Weak", color: "bg-danger" },
  { label: "Fair", color: "bg-accent" },
  { label: "Strong", color: "bg-success" },
];

export function PasswordStrength({ password }: { password: string }) {
  const requirements = getPasswordRequirements(password);
  const level = getStrengthLevel(requirements, password.length > 0);
  const meta = STRENGTH_META[level];

  return (
    <div className="mt-2.5 flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((segment) => (
          <div
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors ${
              password.length > 0 && segment < level ? meta.color : "bg-border"
            }`}
          />
        ))}
        <span className="ml-1 w-14 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
          {password.length > 0 ? meta.label : ""}
        </span>
      </div>

      <ul className="flex flex-col gap-1">
        {requirements.map((req) => (
          <li
            key={req.label}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            {req.met ? (
              <Check className="size-3.5 text-success" aria-hidden="true" />
            ) : (
              <X className="size-3.5 text-muted-foreground/50" aria-hidden="true" />
            )}
            <span className={req.met ? "text-foreground" : ""}>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

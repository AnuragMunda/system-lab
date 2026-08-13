import { Loader2 } from "lucide-react";

export function AuthSubmitButton({
  label,
  loadingLabel,
  loading = false,
}: {
  label: string;
  loadingLabel: string;
  loading?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-primary text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

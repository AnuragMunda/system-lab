"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthInput } from "./auth-input";
import { AuthSubmitButton } from "./auth-submit-button";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Forgot password" form: validates the email, fakes the reset-link request,
// then shows a success state with a link back to sign in.
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setError("Enter your email address.");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(undefined);
    setSubmitting(true);
    // TODO: wire up to POST /api/v1/auth/forgot-password
    // Submits via a stubbed timeout until the API is connected.
    window.setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 900);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="flex size-10 items-center justify-center rounded-full border border-border bg-muted">
          <MailCheck className="size-5 text-primary" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          If an account exists for <span className="text-foreground">{email}</span>,
          we&apos;ve sent a link to reset your password.
        </p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <AuthInput
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        disabled={submitting}
      />

      <AuthSubmitButton
        label="Send reset link"
        loadingLabel="Sending..."
        loading={submitting}
      />

      <Link
        href="/login"
        className="mt-1 inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to sign in
      </Link>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthInput } from "./auth-input";
import { PasswordInput } from "./password-input";
import { AuthCheckbox } from "./auth-checkbox";
import { AuthDivider } from "./auth-divider";
import { SocialAuthButton } from "./social-auth-button";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormError } from "./form-error";

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextErrors: FieldErrors = {};
    if (!email) {
      nextErrors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    // TODO: wire up to POST /api/v1/auth/login and handle the response
    // (incorrect password / server error should populate `setFormError`).
    window.setTimeout(() => setSubmitting(false), 900);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={formError} />

      <AuthInput
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        disabled={submitting}
      />

      <div>
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={submitting}
        />
        <div className="mt-3 flex items-center justify-between">
          <AuthCheckbox name="remember" label="Remember me" disabled={submitting} />
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <AuthSubmitButton
        label="Sign In"
        loadingLabel="Signing in..."
        loading={submitting}
      />

      <AuthDivider />

      <SocialAuthButton disabled />

      <p className="mt-2 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-foreground hover:text-primary">
          Create an account
        </Link>
      </p>
    </form>
  );
}

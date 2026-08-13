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
import { PasswordStrength, getPasswordRequirements } from "./password-strength";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Signup form: validates name/email/password/confirm/terms, enforces password
// requirements via PasswordStrength, then fakes the registration request.
export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextErrors: FieldErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Enter your full name.";
    }
    if (!email) {
      nextErrors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    const requirements = getPasswordRequirements(password);
    if (!password) {
      nextErrors.password = "Create a password.";
    } else if (requirements.some((r) => !r.met)) {
      nextErrors.password = "Password does not meet all requirements.";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    if (!agreed) {
      nextErrors.terms = "You must agree to the Terms of Service and Privacy Policy.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    // TODO: wire up to POST /api/v1/auth/register and handle the response
    // (e.g. email already in use / server error should populate `setFormError`).
    // Submits via a stubbed timeout until the API is connected.
    window.setTimeout(() => setSubmitting(false), 900);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={formError} />

      <AuthInput
        label="Full Name"
        type="text"
        name="name"
        autoComplete="name"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        disabled={submitting}
      />

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
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          disabled={submitting}
        />
        <PasswordStrength password={password} />
      </div>

      <PasswordInput
        label="Confirm Password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        disabled={submitting}
      />

      <div>
        <AuthCheckbox
          name="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={submitting}
          label={
            <>
              I agree to the{" "}
              <Link href="/terms" className="text-foreground hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-foreground hover:text-primary">
                Privacy Policy
              </Link>
            </>
          }
        />
        <FormError message={errors.terms} />
      </div>

      <AuthSubmitButton
        label="Create Account"
        loadingLabel="Creating account..."
        loading={submitting}
      />

      <AuthDivider />

      <SocialAuthButton disabled />

      <p className="mt-2 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:text-primary">
          Sign In
        </Link>
      </p>
    </form>
  );
}

"use client";

import { type SyntheticEvent, useState } from "react";
import Link from "next/link";
import { AuthInput } from "./ui/auth-input";
import { PasswordInput } from "./ui/password-input";
import { AuthCheckbox } from "./ui/auth-checkbox";
import { AuthDivider } from "./ui/auth-divider";
import { SocialAuthButton } from "./ui/social-auth-button";
import { AuthSubmitButton } from "./ui/auth-submit-button";
import { FormError } from "./ui/form-error";
import { PasswordStrength, getPasswordRequirements } from "./ui/password-strength";
import { EMAIL_PATTERN } from "@/lib/constants";
import { validateForm, type FormErrors } from "@/lib/utils";

// Signup form: validates name/email/password/confirm/terms, enforces password
// requirements via PasswordStrength, then fakes the registration request.
export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextErrors = validateForm(
      { name, email, password, confirmPassword, agreed },
      {
        name: { required: "Enter your full name." },
        email: {
          required: "Enter your email address.",
          pattern: {
            value: EMAIL_PATTERN,
            message: "Enter a valid email address.",
          },
        },
        password: {
          required: "Create a password.",
          custom: (value) =>
            getPasswordRequirements(String(value)).some((r) => !r.met)
              ? "Password does not meet all requirements."
              : undefined,
        },
        confirmPassword: {
          required: "Confirm your password.",
          match: { field: "password", message: "Passwords do not match." },
        },
        agreed: {
          checked: {
            message:
              "You must agree to the Terms of Service and Privacy Policy.",
          },
        },
      },
    );

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
              <Link
                href="/terms"
                className="text-foreground hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-foreground hover:text-primary"
              >
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
        <Link
          href="/login"
          className="font-medium text-foreground hover:text-primary"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}

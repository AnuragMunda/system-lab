"use client";

import { type SyntheticEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { loginThunk } from "@/store/authSlice";
import { AuthInput } from "./ui/auth-input";
import { PasswordInput } from "./ui/password-input";
import { AuthCheckbox } from "./ui/auth-checkbox";
import { AuthDivider } from "./ui/auth-divider";
import { SocialAuthButton } from "./ui/social-auth-button";
import { AuthSubmitButton } from "./ui/auth-submit-button";
import { FormError } from "./ui/form-error";
import { EMAIL_PATTERN } from "@/lib/constants";
import { validateForm, type FormErrors } from "@/lib/utils";

// Login form: validates email/password, then fakes the sign-in request.
// Includes remember-me checkbox, forgot-password link, and social auth entry.
export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextErrors = validateForm(
      { email, password },
      {
        email: {
          required: "Enter your email address.",
          pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address." },
        },
        password: { required: "Enter your password." },
      },
    );

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError(undefined);

    try {
      await dispatch(loginThunk({ email, password })).unwrap();
      router.push("/dashboard");
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Something went wrong. Please try again.";
      setFormError(message);
      setSubmitting(false);
    }
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

/**
 * Pure auth input validators — no I/O, fully unit-testable.
 * Returns an error message string or `null` when the value is valid.
 */

export const EMAIL_REQUIRED = "Email is required.";
export const EMAIL_INVALID = "Enter a valid email address.";
export const PASSWORD_REQUIRED = "Password is required.";
export const PASSWORD_TOO_SHORT =
  "Password must be at least 8 characters.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return EMAIL_REQUIRED;
  if (!EMAIL_PATTERN.test(trimmed)) return EMAIL_INVALID;
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return PASSWORD_REQUIRED;
  if (value.length < 8) return PASSWORD_TOO_SHORT;
  return null;
}

export type CredentialErrors = {
  email?: string;
  password?: string;
};

export function validateCredentials(
  email: string,
  password: string,
): CredentialErrors {
  const errors: CredentialErrors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function hasErrors(errors: CredentialErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Guards the `next` parameter against open redirects: only same-origin,
 * non-`//` absolute paths are allowed; anything else falls back.
 */
export function resolveSafeRedirect(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

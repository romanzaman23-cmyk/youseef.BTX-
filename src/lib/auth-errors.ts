export function getLoginError(error?: string): string | undefined {
  if (error === "CredentialsSignin") return "Invalid email or password";
  if (error) return "Login failed. Please try again.";
  return undefined;
}

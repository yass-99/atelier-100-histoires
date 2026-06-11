import "server-only";
import { currentUser } from "@clerk/nextjs/server";

/** Liste d'emails autorisés (ADMIN_EMAILS, séparés par virgule), en minuscules. */
function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  return !!email && allowlist().includes(email);
}

/** Lève "FORBIDDEN" si l'utilisateur courant n'est pas un admin autorisé. */
export async function requireAdmin(): Promise<string> {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email || !allowlist().includes(email)) throw new Error("FORBIDDEN");
  return email;
}

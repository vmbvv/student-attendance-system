import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

export type AuthRole = "teacher" | "student";

export interface AuthPayload {
  id: string;
  role: AuthRole;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

function getExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || "7d";
}

function isAuthRole(value: unknown): value is AuthRole {
  return value === "teacher" || value === "student";
}

export function signAccessToken({
  id,
  role,
}: {
  id: string | number;
  role: AuthRole;
}): string {
  const expiresIn = (getExpiresIn() || "7d") as SignOptions["expiresIn"];
  return jwt.sign({ role }, getJwtSecret(), {
    subject: String(id),
    expiresIn,
  });
}

export function verifyAccessToken(token: string): AuthPayload | null {
  const payload = jwt.verify(token, getJwtSecret());
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const parsed = payload as JwtPayload & { role?: unknown };
  const id = parsed.sub;
  const role = parsed.role;

  if (!id || !isAuthRole(role)) {
    return null;
  }

  return { id: String(id), role };
}

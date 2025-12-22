import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";

const BCRYPT_PATTERN = /^\$2[abxy]\$\d{2}\$/;
const DEFAULT_SALT_ROUNDS = 10;

export function isBcryptHash(value: unknown): boolean {
  return BCRYPT_PATTERN.test(String(value || ""));
}

function safeEqualStrings(a: unknown, b: unknown): boolean {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function hashPassword(password: string): Promise<string> {
  const configuredRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
  const saltRounds =
    Number.isFinite(configuredRounds) && configuredRounds > 0
      ? configuredRounds
      : DEFAULT_SALT_ROUNDS;
  return bcrypt.hash(String(password), saltRounds);
}

export async function verifyPassword(
  password: string,
  storedPassword: unknown
): Promise<boolean> {
  const plain = String(password);
  const stored = String(storedPassword || "");

  if (!stored) return false;

  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored);
  }

  return safeEqualStrings(plain, stored);
}


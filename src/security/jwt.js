import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

function getExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "7d";
}

export function signAccessToken({ id, role }) {
  return jwt.sign(
    { role },
    getJwtSecret(),
    { subject: String(id), expiresIn: getExpiresIn() }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, getJwtSecret());
  const id = payload?.sub;
  const role = payload?.role;

  if (!id || !role) {
    return null;
  }

  return { id: String(id), role: String(role) };
}


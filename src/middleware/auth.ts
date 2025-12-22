import type { NextFunction, Request, Response } from "express";
import type { AuthRole } from "../security/jwt.js";
import { verifyAccessToken } from "../security/jwt.js";

function getTokenFromRequest(req: Request): string | null {
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return String(cookieToken);

  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const auth = verifyAccessToken(token);
    if (!auth) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    req.auth = auth;
    return next();
  } catch {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
}

export function requireRole(role: AuthRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    if (req.auth.role !== role) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }
    return next();
  };
}

import { verifyAccessToken } from "../security/jwt.js";

function getTokenFromRequest(req) {
  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return null;
}

export function requireAuth(req, res, next) {
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

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    if (req.auth.role !== role) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }
    return next();
  };
}

export function requireParamUserId(paramName) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    if (String(req.auth.id) !== String(req.params[paramName])) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }
    return next();
  };
}


import type { CookieOptions, Request, Response } from "express";
import {
  registerTeacherService,
  loginTeacherService,
  loginStudentService,
  logoutService,
} from "../services/user.js";
import { signAccessToken } from "../security/jwt.js";

function parseExpiresInToMs(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined;
  }

  const match = trimmed.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return undefined;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;

  const unit = match[2];
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const multiplier = multipliers[unit];
  return multiplier ? amount * multiplier : undefined;
}

const baseCookieOptions: CookieOptions = {
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

const legacyIdCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  httpOnly: false,
};

const accessTokenMaxAgeMs = parseExpiresInToMs(process.env.JWT_EXPIRES_IN);
const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  httpOnly: true,
  ...(accessTokenMaxAgeMs ? { maxAge: accessTokenMaxAgeMs } : {}),
};

interface RegisterTeacherBody {
  firstname: string;
  lastname: string;
  password: string;
  registrationToken?: string;
  confirmPassword?: string;
}

interface LoginBody {
  id: string;
  password: string;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeId(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function normalizeHeader(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return "";
}

function badRequest(res: Response, message: string) {
  return res.status(400).json({ ok: false, message });
}

export async function registerTeacher(
  req: Request<Record<string, string>, unknown, RegisterTeacherBody>,
  res: Response
) {
  try {
    const firstname = normalizeString(req.body?.firstname);
    const lastname = normalizeString(req.body?.lastname);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const confirmPassword =
      typeof req.body?.confirmPassword === "string" ? req.body.confirmPassword : "";

    if (!firstname || !lastname || !password) {
      return badRequest(res, "Мэдээлэл буруу байна");
    }
    if (confirmPassword && password !== confirmPassword) {
      return badRequest(res, "Нууц үг таарахгүй байна");
    }
    if (password.length < 6) {
      return badRequest(res, "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
    }

    const requiredToken = process.env.TEACHER_REGISTRATION_TOKEN;
    if (requiredToken) {
      const providedToken =
        normalizeString(req.body?.registrationToken) ||
        normalizeHeader(req.headers["x-registration-token"]) ||
        normalizeHeader(req.headers["x-teacher-registration-token"]);

      if (!providedToken || providedToken !== requiredToken) {
        return res
          .status(403)
          .json({ ok: false, message: "Бүртгэлийн токен буруу байна" });
      }
    }

    const result = await registerTeacherService(
      firstname,
      lastname,
      password
    );
    return res.json(result);
  } catch (err) {
    console.error("Багшыг бүртгүүлэхэд алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function loginTeacher(
  req: Request<Record<string, string>, unknown, LoginBody>,
  res: Response
) {
  try {
    const id = normalizeId(req.body?.id);
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!id || !password) {
      return badRequest(res, "Мэдээлэл буруу байна");
    }

    const result = await loginTeacherService(id, password);

    if (!result.ok) {
      res.clearCookie("accessToken", {
        ...baseCookieOptions,
        httpOnly: true,
      });
      return res.status(401).json(result);
    }

    const token = signAccessToken({ id: String(result.id), role: "teacher" });

    res.clearCookie("studentId", legacyIdCookieOptions);
    res.clearCookie("teacherId", legacyIdCookieOptions);
    res.cookie("accessToken", token, accessTokenCookieOptions);

    return res.json(result);
  } catch (err) {
    console.error("Багш нэвтрэхэд алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function loginStudent(
  req: Request<Record<string, string>, unknown, LoginBody>,
  res: Response
) {
  try {
    const id = normalizeId(req.body?.id);
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!id || !password) {
      return badRequest(res, "Мэдээлэл буруу байна");
    }

    const result = await loginStudentService(id, password);

    if (!result.ok) {
      res.clearCookie("accessToken", {
        ...baseCookieOptions,
        httpOnly: true,
      });
      return res.status(401).json(result);
    }

    const token = signAccessToken({ id: String(result.id), role: "student" });

    res.clearCookie("teacherId", legacyIdCookieOptions);
    res.clearCookie("studentId", legacyIdCookieOptions);
    res.cookie("accessToken", token, accessTokenCookieOptions);

    return res.json(result);
  } catch (err) {
    console.error("Сурагч нэвтрэхэд алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function logout(_req: Request, res: Response) {
  try {
    res.clearCookie("teacherId", legacyIdCookieOptions);
    res.clearCookie("studentId", legacyIdCookieOptions);
    res.clearCookie("accessToken", {
      ...baseCookieOptions,
      httpOnly: true,
    });
    const result = await logoutService();
    return res.json(result);
  } catch (err) {
    console.error("Системээс гарахад алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

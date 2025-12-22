import type { Request, Response } from "express";
import {
  getStudentsService,
  createStudentService,
  deleteStudentService,
  getTeacherProfileService,
  changeTeacherPasswordService,
} from "../services/teacher.js";

interface CreateStudentBody {
  firstname: string;
  lastname: string;
  password: string;
  confirmPassword?: string;
}

interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function getStudents(req: Request, res: Response) {
  const teacherId = req.auth?.id;
  if (!teacherId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const rawPage = typeof req.query.page === "string" ? req.query.page : "";
    const rawLimit = typeof req.query.limit === "string" ? req.query.limit : "";

    const page = rawPage ? Number.parseInt(rawPage, 10) : 1;
    const limit = rawLimit ? Number.parseInt(rawLimit, 10) : 25;

    const result = await getStudentsService(teacherId, search, page, limit);
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error("Failed to fetch students", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function createStudent(
  req: Request<Record<string, never>, unknown, CreateStudentBody>,
  res: Response
) {
  const teacherId = req.auth?.id;
  if (!teacherId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const firstname = normalizeString(req.body?.firstname);
    const lastname = normalizeString(req.body?.lastname);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const confirmPassword =
      typeof req.body?.confirmPassword === "string" ? req.body.confirmPassword : "";

    if (!firstname || !lastname || !password) {
      return res.status(400).json({ ok: false, message: "Мэдээлэл буруу байна" });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ ok: false, message: "Нууц үг таарахгүй байна" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ ok: false, message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" });
    }

    const result = await createStudentService(
      teacherId,
      firstname,
      lastname,
      password
    );
    return res.json(result);
  } catch (err) {
    console.error("Failed to create student", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function deleteStudent(req: Request, res: Response) {
  const teacherId = req.auth?.id;
  if (!teacherId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const { studentId } = req.params;

  try {
    const result = await deleteStudentService(teacherId, studentId);
    const status = result.ok === false ? 404 : 200;
    return res.status(status).json(result);
  } catch (err) {
    console.error("Failed to delete student", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function getTeacherProfile(req: Request, res: Response) {
  const teacherId = req.auth?.id;
  if (!teacherId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const result = await getTeacherProfileService(teacherId);
    if (result.ok === false) {
      const status = result.status || 400;
      return res.status(status).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("Failed to load teacher profile", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function changeTeacherPassword(
  req: Request<Record<string, never>, unknown, ChangePasswordBody>,
  res: Response
) {
  const teacherId = req.auth?.id;
  if (!teacherId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const oldPassword =
    typeof req.body?.oldPassword === "string" ? req.body.oldPassword : "";
  const newPassword =
    typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
  const confirmNewPassword =
    typeof req.body?.confirmNewPassword === "string"
      ? req.body.confirmNewPassword
      : "";

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ ok: false, message: "Мэдээлэл буруу байна" });
  }
  if (confirmNewPassword && newPassword !== confirmNewPassword) {
    return res
      .status(400)
      .json({ ok: false, message: "Нууц үг таарахгүй байна" });
  }
  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ ok: false, message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" });
  }

  try {
    const result = await changeTeacherPasswordService(
      teacherId,
      oldPassword,
      newPassword
    );
    const status = result.ok === false ? 400 : 200;
    return res.status(status).json(result);
  } catch (err) {
    console.error("Failed to change teacher password", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

import type { Request, Response } from "express";
import {
  getMyAttendanceService,
  changePasswordService,
  getStudentProfileService,
} from "../services/student.js";

interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword?: string;
}

export async function getMyAttendance(req: Request, res: Response) {
  const studentId = req.auth?.id;
  if (!studentId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const month = typeof req.query.month === "string" ? req.query.month : "";
    const result = await getMyAttendanceService(studentId, month);
    return res.json(result);
  } catch (err) {
    console.error("Failed to load attendance", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function changePassword(
  req: Request<Record<string, never>, unknown, ChangePasswordBody>,
  res: Response
) {
  const studentId = req.auth?.id;
  if (!studentId) {
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
    const result = await changePasswordService(
      studentId,
      oldPassword,
      newPassword
    );
    const status = result.ok === false ? 400 : 200;
    return res.status(status).json(result);
  } catch (err) {
    console.error("Failed to change password", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function getStudentProfile(req: Request, res: Response) {
  const studentId = req.auth?.id;
  if (!studentId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const result = await getStudentProfileService(studentId);
    if (result.ok === false) {
      const status = result.status || 400;
      return res.status(status).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("Failed to load student profile", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

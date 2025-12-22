import type { Request, Response } from "express";
import {
  upsertAttendanceService,
  getAttendanceByDateService,
  getTeacherSummaryService,
  getStudentAttendanceHistoryService,
} from "../services/attendance.js";

interface UpsertAttendanceBody {
  studentId: string;
  date: string;
  attendance: string;
}

function getLocalDateString(sourceDate: Date = new Date()): string {
  const d = new Date(sourceDate);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export async function upsertAttendance(
  req: Request<Record<string, never>, unknown, UpsertAttendanceBody>,
  res: Response
) {
  const teacherId = req.auth?.id;
  if (!teacherId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const studentId =
    typeof req.body?.studentId === "string" ? req.body.studentId.trim() : "";
  const date = typeof req.body?.date === "string" ? req.body.date.trim() : "";
  const attendance =
    typeof req.body?.attendance === "string"
      ? req.body.attendance.trim()
      : "";

  if (!studentId || !date || !attendance) {
    return res.status(400).json({ ok: false, message: "Мэдээлэл буруу байна" });
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) {
    return res.status(400).json({ ok: false, message: "Огноо буруу байна" });
  }

  const allowedValues = ["present", "absent", "excused"];
  if (!allowedValues.includes(attendance)) {
    return res.status(400).json({ ok: false, message: "Ирцийн утга буруу байна" });
  }

  try {
    const result = await upsertAttendanceService(
      teacherId,
      studentId,
      date,
      attendance
    );
    const status = result.ok === false ? 400 : 200;
    return res.status(status).json(result);
  } catch (err) {
    console.error("Failed to upsert attendance", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function getAttendanceByDate(req: Request, res: Response) {
  const teacherId = req.auth?.id;
  if (!teacherId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const date = typeof req.query.date === "string" ? req.query.date : "";
    const targetDate = date || getLocalDateString();
    const result = await getAttendanceByDateService(teacherId, targetDate);
    return res.json(result);
  } catch (err) {
    console.error("Failed to get attendance by date", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function getTeacherSummary(req: Request, res: Response) {
  const teacherId = req.auth?.id;
  if (!teacherId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const sort = typeof req.query.sort === "string" ? req.query.sort : "";
    const result = await getTeacherSummaryService(teacherId, sort);
    return res.json(result);
  } catch (err) {
    console.error("Failed to get teacher summary", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function getStudentAttendanceHistory(req: Request, res: Response) {
  const teacherId = req.auth?.id;
  if (!teacherId) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const { studentId } = req.params;

  try {
    const month = typeof req.query.month === "string" ? req.query.month : "";
    const result = await getStudentAttendanceHistoryService(
      teacherId,
      studentId,
      month
    );
    if (result.ok === false) {
      const status = result.status || 400;
      return res.status(status).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("Failed to get student attendance history", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

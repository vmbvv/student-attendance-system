import {
  upsertAttendanceService,
  getAttendanceByDateService,
  getTeacherSummaryService,
  getStudentAttendanceHistoryService,
} from "../services/attendance.js";

import { RequestHandler } from "express";
import { User } from "../types/type.js";

function verifyTeacherCookie(req, res, teacherId) {
  const cookieTeacherId = req.cookies?.teacherId;
  if (!cookieTeacherId || String(cookieTeacherId) !== String(teacherId)) {
    res.status(401).json({
      ok: false,
      message: "Багшийн cookie буруу байна",
    });
    return false;
  }
  return true;
}

function getLocalDateString(sourceDate = new Date()) {
  const d = new Date(sourceDate);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export async function upsertAttendance(req, res) {
  const { teacherId } = req.params;
  const { studentId, date, attendance } = req.body;
  if (!verifyTeacherCookie(req, res, teacherId)) return;

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
    console.error("Ирц бүртгэхэд алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function getAttendanceByDate(req, res) {
  const { teacherId } = req.params;
  if (!verifyTeacherCookie(req, res, teacherId)) return;

  try {
    const { date } = req.query;
    const targetDate = date || getLocalDateString();
    const result = await getAttendanceByDateService(teacherId, targetDate);
    return res.json(result);
  } catch (err) {
    console.error("Алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function getTeacherSummary(req, res) {
  const { teacherId } = req.params;
  if (!verifyTeacherCookie(req, res, teacherId)) return;

  try {
    const { sort } = req.query;
    const result = await getTeacherSummaryService(teacherId, sort);
    return res.json(result);
  } catch (err) {
    console.error("Алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function getStudentAttendanceHistory(req, res) {
  const { teacherId, studentId } = req.params;
  if (!verifyTeacherCookie(req, res, teacherId)) return;

  try {
    const { month } = req.query;
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
    console.error("Алдаа гарлаа", err);
    return res.status(500).json({
      ok: false,
      message: "Серверт алдаа гарлаа",
    });
  }
}

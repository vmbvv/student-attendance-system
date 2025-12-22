import {
  upsertAttendanceService,
  getAttendanceByDateService,
  getTeacherSummaryService,
  getStudentAttendanceHistoryService,
} from "../services/attendance.js";

function getLocalDateString(sourceDate = new Date()) {
  const d = new Date(sourceDate);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export async function upsertAttendance(req, res) {
  const { teacherId } = req.params;
  const { studentId, date, attendance } = req.body;

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

export async function getAttendanceByDate(req, res) {
  const { teacherId } = req.params;

  try {
    const { date } = req.query;
    const targetDate = date || getLocalDateString();
    const result = await getAttendanceByDateService(teacherId, targetDate);
    return res.json(result);
  } catch (err) {
    console.error("Failed to get attendance by date", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function getTeacherSummary(req, res) {
  const { teacherId } = req.params;

  try {
    const { sort } = req.query;
    const result = await getTeacherSummaryService(teacherId, sort);
    return res.json(result);
  } catch (err) {
    console.error("Failed to get teacher summary", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function getStudentAttendanceHistory(req, res) {
  const { teacherId, studentId } = req.params;

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
    console.error("Failed to get student attendance history", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}


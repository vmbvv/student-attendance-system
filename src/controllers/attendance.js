import {
  upsertAttendanceService,
  getAttendanceByDateService,
  getTeacherSummaryService,
} from "../services/attendance.js";

export async function upsertAttendance(req, res) {
  const { teacherId } = req.params;
  const { studentId, date, attendance } = req.body;
  // TODO: багш зөвшөөрөгдсөн эсэхийг cookie-оос шалгах
  const result = await upsertAttendanceService(teacherId, studentId, date, attendance);
  return res.json(result);
}

export async function getAttendanceByDate(req, res) {
  const { teacherId } = req.params;
  const { date } = req.query;
  // TODO: параметр байхгүй үед өнөөдрийн огноог автоматаар ашиглах
  const result = await getAttendanceByDateService(teacherId, date);
  return res.json(result);
}

export async function getTeacherSummary(req, res) {
  const { teacherId } = req.params;
  const { sort } = req.query;
  const result = await getTeacherSummaryService(teacherId, sort);
  return res.json(result);
}

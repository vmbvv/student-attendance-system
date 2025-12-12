import { db } from "../db.js";

export async function upsertAttendanceService(
  teacherId,
  studentId,
  date,
  attendance
) {
  // TODO: student тухайн багшийнх эсэхийг teacher_id-гаар баталгаажуулах
  // TODO: attendance_history дээр (student_id, date) UPSERT хийх
  return { ok: false, todo: true };
}

export async function getAttendanceByDateService(teacherId, date) {
  // TODO: тухайн өдрийн ирцийг teacher_id-гаар шүүж, сурагчийн нэртэй хамт буцаах
  // TODO: SELECT u.id, u.firstname, u.lastname, ah.attendance FROM attendance_history ah JOIN users u ON ah.student_id = u.id WHERE u.teacher_id = $1 AND ah.date = $2
  return [];
}

export async function getTeacherSummaryService(teacherId, sort) {
  // TODO: v_student_attendance_summary харагдацаас teacher_id-гаар шүүж, sort параметр байвал ашиглах
  return [];
}

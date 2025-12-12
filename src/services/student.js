import { db } from "../db.js";

export async function getMyAttendanceService(studentId) {
  // TODO: attendance_history хүснэгтээс тухайн сурагчийн бүх өдрийн ирцийг авах
  return [];
}

export async function changePasswordService(studentId, oldPassword, newPassword) {
  // TODO: хуучин нууц үг таарч байгааг шалгаад UPDATE users SET password = $1 WHERE id = $2 хийх
  return { ok: false, todo: true };
}

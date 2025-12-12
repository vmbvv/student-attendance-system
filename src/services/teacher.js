import { db } from "../db.js";

export async function getStudentsService(teacherId, search) {
  // TODO: SELECT id, firstname, lastname, age FROM users WHERE teacher_id = $1 AND role = 'student'
  // TODO: search query байвал нэрээр нь ILIKE ашиглаад шүүх
  return [];
}

export async function createStudentService(teacherId, firstname, lastname, age, password) {
  // TODO: INSERT INTO users (firstname, lastname, age, password, role, teacher_id) VALUES ($1, $2, $3, $4, 'student', $5) RETURNING id
  return { ok: false, todo: true };
}

export async function deleteStudentService(teacherId, studentId) {
  // TODO: DELETE FROM users WHERE id = $1 AND teacher_id = $2 AND role = 'student'
  return { ok: false, todo: true };
}

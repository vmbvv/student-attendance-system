import { db } from "../db.js";

export const getStudentsService = async (student) => {
  const response = await db.query(
    `SELECT * FROM users users WHERE role = ${student}`
  );
  // TODO: SELECT id, firstname, lastname, age FROM users WHERE teacher_id = $1 AND role = 'student'
  // TODO: search query байвал нэрээр нь ILIKE ашиглаад шүүх
  return response.rows;
};

export const getStudentService = async (student, id) => {
  const response = await db.query(
    `SELECT * FROM users WHERE role = ${student} and id=${id}`
  );
  return response.rows[0];
};
export async function createStudentService(
  teacherId,
  firstname,
  lastname,
  age,
  password
) {
  // TODO: INSERT INTO users (firstname, lastname, age, password, role, teacher_id) VALUES ($1, $2, $3, $4, 'student', $5) RETURNING id
  return { ok: false, todo: true };
}

export async function deleteStudentService(teacherId, studentId) {
  // TODO: DELETE FROM users WHERE id = $1 AND teacher_id = $2 AND role = 'student'
  return { ok: false, todo: true };
}

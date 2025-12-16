import { db } from "../db.js";

export const getStudentsService = async () => {
  const response = await db.query(`SELECT * FROM users WHERE role = 'student'`);
  return response.rows;
};
export const getStudentService = async (id) => {
  const response = await db.query(
    `SELECT * FROM users WHERE role = 'student' and id = ${id}`
  );
  return response.rows[0];
};
export const createStudentService = async (
  teacherId,
  firstname,
  lastname,
  age,
  password
) => {
  `INSERT INTO users (firstname, lastname, age, password, role, teacher_id) VALUES ($1, $2, $3, $4, 'student', $5) RETURNING id`;
  return { ok: false, todo: true };
};

export async function deleteStudentService(teacherId, studentId) {
  // TODO: DELETE FROM users WHERE id = $1 AND teacher_id = $2 AND role = 'student'
  return { ok: false, todo: true };
}

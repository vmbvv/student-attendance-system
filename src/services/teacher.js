import { response } from "express";
import { db } from "../db.js";
import pg from "pg";

export const getStudentsService = async () => {
  const response = await db.query(`SELECT * FROM users WHERE role = 'student'`);
  return response.rows;
};
export const getStudentService = async (id, teacher_id) => {
  const response = await db.query(
    `SELECT * FROM users WHERE role = 'student' and id = ${id} and teacher_id=${teacher_id}`
  );
  return response.rows[0];
};
export const createStudentService = async (
  teacher_id,
  firstname,
  lastname,
  age,
  password
) => {
  `INSERT INTO users (teacher_id, firstname, lastname, age, password) VALUES ($1, $2, $3, $4, $5, 'student') RETURNING id`;
  [teacher_id, firstname, lastname, age, password];
  return response.rows;
};

export async function deleteStudentService(teacherId, studentId) {
  // TODO: DELETE FROM users WHERE id = $1 AND teacher_id = $2 AND role = 'student'
  return { ok: false, todo: true };
}

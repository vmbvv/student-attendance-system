import { response } from "express";
import { db } from "../db.js";

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
  const response = await db.query(
    `INSERT INTO users (teacher_id, firstname, lastname, age, password, role) VALUES ($1, $2, $3, $4, $5, 'student') RETURNING id`,
    [teacher_id, firstname, lastname, age, password]
  );
  return response.rows;
};

export const deleteStudentService = async (id) => {
  const response = db.query(
    `DELETE FROM users WHERE id = ${id} AND role = 'student'`
  );
  return response.rows;
};

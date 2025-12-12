import { db } from "../db.js";

export async function registerTeacherService(
  firstname,
  lastname,
  age,
  password
) {
  // TODO: INSERT INTO users (firstname, lastname, age, password, role) VALUES ($1, $2, $3, $4, 'teacher') RETURNING id
  const response = await db.query(
    `INSERT INTO users (firstname, lastname, age, password, role) VALUES ($1, $2, $3, $4, 'teacher') RETURNING id`,
    [firstname, lastname, age, password]
  );
  return response.rows[0];
}

export async function loginTeacherService(id, password) {
  // TODO: багшийн id, нууц үгийг users хүснэгтээс шалгах
  const teachers = await db.query(`SELECT * FROM users WHERE role = 'teacher'`);
  console.log(teachers);
  // TODO: амжилттай бол cookie-нд хадгалах teacher_id утгыг backend-ээс буцаах
  return { ok: false, todo: true };
}

export async function loginStudentService(id, password) {
  // TODO: сурагчийн id, нууц үгийг users хүснэгтээс шалгах
  // TODO: амжилттай бол cookie-нд хадгалах student_id утгыг backend-ээс буцаах
  return { ok: false, todo: true };
}

export async function logoutService() {
  // TODO: logout хийхэд сервер талд cookie-г арилгах логик нэмэх
  return { ok: false, todo: true };
}

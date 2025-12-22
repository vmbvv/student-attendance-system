import { db } from "../db.js";
import { hashPassword, verifyPassword } from "../security/passwords.js";

export async function registerTeacherService(
  firstname,
  lastname,
  age,
  password
) {
  const passwordHash = await hashPassword(password);
  //  INSERT INTO users (firstname, lastname, age, password, role) VALUES ($1, $2, $3, $4, 'teacher') RETURNING id
  const { rows } = await db.query(
    `INSERT INTO users (firstname, lastname, age, password, role) VALUES ($1, $2, $3, $4, 'teacher') RETURNING id`,
    [firstname, lastname, age ?? null, passwordHash]
  );
  return { ok: true, id: rows[0].id };
}

export async function loginTeacherService(id, password) {
  //  багшийн id, нууц үгийг users хүснэгтээс шалгах
  const { rows } = await db.query(
    `SELECT id, password FROM users WHERE id = $1 AND role = 'teacher'`,
    [id]
  );

  if (rows.length === 0) {
    return { ok: false, message: "ID эсвэл Нууц үг буруу байна!" };
  }

  if (!(await verifyPassword(password, rows[0].password))) {
    return { ok: false, message: "ID эсвэл Нууц үг буруу байна!" };
  }
  //  амжилттай бол cookie-нд хадгалах teacher_id утгыг backend-ээс буцаах
  return { ok: true, id: rows[0].id };
}

export async function loginStudentService(id, password) {
  //  сурагчийн id, нууц үгийг users хүснэгтээс шалгах

  const { rows } = await db.query(
    `SELECT id, password FROM users WHERE id = $1 AND role = 'student'`,
    [id]
  );

  if (rows.length === 0) {
    return { ok: false, message: "ID эсвэл Нууц үг буруу байна!" };
  }

  if (!(await verifyPassword(password, rows[0].password))) {
    return { ok: false, message: "ID эсвэл Нууц үг буруу байна!" };
  }

  //  амжилттай бол cookie-нд хадгалах student_id утгыг backend-ээс буцаах
  return { ok: true, id: rows[0].id };
}

export async function logoutService() {
  //  logout хийхэд сервер талд cookie-г арилгах логик нэмэх
  return { ok: true, message: "Системээс гарлаа" };
}

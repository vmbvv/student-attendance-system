import { db } from "../db.js";
import { hashPassword, verifyPassword } from "../security/passwords.js";

export type UserId = string | number;

export type AuthOk = { ok: true; id: UserId };
export type AuthError = { ok: false; message: string };

export async function registerTeacherService(
  firstname: string,
  lastname: string,
  password: string
): Promise<AuthOk> {
  const passwordHash = await hashPassword(password);
  const { rows } = await db.query<{ id: UserId }>(
    "INSERT INTO users (firstname, lastname, password, role) VALUES ($1, $2, $3, 'teacher') RETURNING id",
    [firstname, lastname, passwordHash]
  );
  return { ok: true, id: rows[0].id };
}

export async function loginTeacherService(
  id: string,
  password: string
): Promise<AuthOk | AuthError> {
  const { rows } = await db.query<{ id: UserId; password: unknown }>(
    "SELECT id, password FROM users WHERE id = $1 AND role = 'teacher'",
    [id]
  );

  if (rows.length === 0) {
    return {
      ok: false,
      message: "ID эсвэл Нууц үг буруу байна!",
    };
  }

  if (!(await verifyPassword(password, rows[0].password))) {
    return {
      ok: false,
      message: "ID эсвэл Нууц үг буруу байна!",
    };
  }

  return { ok: true, id: rows[0].id };
}

export async function loginStudentService(
  id: string,
  password: string
): Promise<AuthOk | AuthError> {
  const { rows } = await db.query<{ id: UserId; password: unknown }>(
    "SELECT id, password FROM users WHERE id = $1 AND role = 'student'",
    [id]
  );

  if (rows.length === 0) {
    return {
      ok: false,
      message: "ID эсвэл Нууц үг буруу байна!",
    };
  }

  if (!(await verifyPassword(password, rows[0].password))) {
    return {
      ok: false,
      message: "ID эсвэл Нууц үг буруу байна!",
    };
  }

  return { ok: true, id: rows[0].id };
}

export async function logoutService(): Promise<{ ok: true; message: string }> {
  return { ok: true, message: "Системээс гарлаа" };
}

import { db } from "../db.js";
import { hashPassword } from "../security/passwords.js";

type UserId = string | number;

export interface StudentRow {
  id: UserId;
  firstname: string;
  lastname: string;
}

export async function getStudentsService(
  teacherId: string,
  search?: string
): Promise<StudentRow[]> {
  const params: Array<string> = [teacherId];
  let query =
    "SELECT id, firstname, lastname FROM users WHERE teacher_id = $1 AND role = 'student'";

  if (search) {
    params.push(`%${search}%`);
    query +=
      " AND (firstname ILIKE $2 OR lastname ILIKE $2 OR CONCAT(firstname, ' ', lastname) ILIKE $2)";
  }

  query += " ORDER BY lastname, firstname";

  const { rows } = await db.query<StudentRow>(query, params);
  return rows;
}

export async function createStudentService(
  teacherId: string,
  firstname: string,
  lastname: string,
  password: string
): Promise<{ ok: true; id: UserId }> {
  const passwordHash = await hashPassword(password);
  const { rows } = await db.query<{ id: UserId }>(
    "INSERT INTO users (firstname, lastname, password, role, teacher_id) VALUES ($1, $2, $3, 'student', $4) RETURNING id",
    [firstname, lastname, passwordHash, teacherId]
  );
  return { ok: true, id: rows[0].id };
}

export async function deleteStudentService(
  teacherId: string,
  studentId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await db.query(
    "DELETE FROM users WHERE id = $1 AND teacher_id = $2 AND role = 'student'",
    [studentId, teacherId]
  );

  if (result.rowCount === 0) {
    return { ok: false, message: "Тухайн багшид харьяатай сурагч олдсонгүй" };
  }

  return { ok: true };
}

export async function getTeacherProfileService(
  teacherId: string
): Promise<
  | { ok: true; teacher: { id: UserId; firstname: string; lastname: string } }
  | { ok: false; status: 404; message: string }
> {
  const { rows } = await db.query<{ id: UserId; firstname: string; lastname: string }>(
    "SELECT id, firstname, lastname FROM users WHERE id = $1 AND role = 'teacher'",
    [teacherId]
  );

  if (rows.length === 0) {
    return { ok: false, status: 404, message: "Багш олдсонгүй" };
  }

  return { ok: true, teacher: rows[0] };
}

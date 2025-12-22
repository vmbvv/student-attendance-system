import { db } from "../db.js";
import { hashPassword, verifyPassword } from "../security/passwords.js";

type UserId = string | number;

export interface StudentRow {
  id: UserId;
  firstname: string;
  lastname: string;
}

export interface PaginatedStudentsResult {
  students: StudentRow[];
  total: number;
  page: number;
  limit: number;
}

export async function getStudentsService(
  teacherId: string,
  search: string,
  page: number,
  limit: number
): Promise<PaginatedStudentsResult> {
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 25;
  const requestedPage = Number.isFinite(page) ? Math.max(page, 1) : 1;

  const baseParams: Array<string | number> = [teacherId];
  let searchCondition = "";
  if (search) {
    baseParams.push(`%${search}%`);
    const searchParam = `$${baseParams.length}`;
    searchCondition = ` AND (firstname ILIKE ${searchParam} OR lastname ILIKE ${searchParam} OR CONCAT(firstname, ' ', lastname) ILIKE ${searchParam})`;
  }

  const whereClause = `WHERE teacher_id = $1 AND role = 'student'${searchCondition}`;

  const countResult = await db.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM users ${whereClause}`,
    baseParams
  );
  const total = countResult.rows[0]?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / safeLimit) : 1;
  const safePage = Math.min(requestedPage, totalPages);
  const offset = (safePage - 1) * safeLimit;

  const limitParam = `$${baseParams.length + 1}`;
  const offsetParam = `$${baseParams.length + 2}`;

  const { rows } = await db.query<StudentRow>(
    `SELECT id, firstname, lastname FROM users ${whereClause} ORDER BY lastname, firstname LIMIT ${limitParam} OFFSET ${offsetParam}`,
    [...baseParams, safeLimit, offset]
  );

  return { students: rows, total, page: safePage, limit: safeLimit };
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

export async function changeTeacherPasswordService(
  teacherId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { rows } = await db.query<{ password: unknown }>(
    "SELECT password FROM users WHERE id = $1 AND role = 'teacher'",
    [teacherId]
  );

  if (rows.length === 0) {
    return { ok: false, message: "Багш олдсонгүй" };
  }

  if (!(await verifyPassword(oldPassword, rows[0].password))) {
    return { ok: false, message: "Хуучин нууц үг буруу байна" };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.query("UPDATE users SET password = $1 WHERE id = $2", [
    passwordHash,
    teacherId,
  ]);

  return { ok: true };
}

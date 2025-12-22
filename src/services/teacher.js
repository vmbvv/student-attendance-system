import { db } from "../db.js";
import { hashPassword } from "../security/passwords.js";

export async function getStudentsService(teacherId, search) {
  // Зөвхөн энэ багшид харьяалагдах сурагчдийг олох
  const params = [teacherId];
  let query =
    "SELECT id, firstname, lastname, age FROM users WHERE teacher_id = $1 AND role = 'student'";

  if (search) {
    params.push(`%${search}%`);
    query +=
      " AND (firstname ILIKE $2 OR lastname ILIKE $2 OR CONCAT(firstname, ' ', lastname) ILIKE $2)";
  }

  query += " ORDER BY lastname, firstname";

  const { rows } = await db.query(query, params);
  return rows;
}

export async function createStudentService(
  teacherId,
  firstname,
  lastname,
  age,
  password
) {
  const passwordHash = await hashPassword(password);
  const { rows } = await db.query(
    "INSERT INTO users (firstname, lastname, age, password, role, teacher_id) VALUES ($1, $2, $3, $4, 'student', $5) RETURNING id",
    [firstname, lastname, age ?? null, passwordHash, teacherId]
  );
  return { ok: true, id: rows[0].id };
}

export async function deleteStudentService(teacherId, studentId) {
  // Зөвхөн багш өөрт харьяалагдах сурагчийг хасах
  const result = await db.query(
    "DELETE FROM users WHERE id = $1 AND teacher_id = $2 AND role = 'student'",
    [studentId, teacherId]
  );

  if (result.rowCount === 0) {
    return { ok: false, message: "Тухайн багшид харьяатай сурагч олдсонгүй" };
  }

  return { ok: true };
}

export async function getTeacherProfileService(teacherId) {
  const { rows } = await db.query(
    "SELECT id, firstname, lastname FROM users WHERE id = $1 AND role = 'teacher'",
    [teacherId]
  );

  if (rows.length === 0) {
    return { ok: false, status: 404, message: "Багш олдсонгүй" };
  }

  return { ok: true, teacher: rows[0] };
}

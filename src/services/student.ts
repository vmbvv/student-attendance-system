import { db } from "../db.js";
import { hashPassword, verifyPassword } from "../security/passwords.js";

type UserId = string | number;

interface MonthBounds {
  start: string;
  end: string;
}

function getMonthBounds(month: string): MonthBounds {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthNum = Number(monthStr);
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? year + 1 : year;
  const start = `${yearStr}-${monthStr}-01`;
  const end = `${String(nextYear).padStart(4, "0")}-${String(
    nextMonth
  ).padStart(2, "0")}-01`;
  return { start, end };
}

function formatDateOnly(value: unknown): string {
  if (value instanceof Date) {
    const d = new Date(value);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

export async function getMyAttendanceService(
  studentId: string,
  month?: string
): Promise<{ ok: true; month: string; records: Array<{ date: string; attendance: string }> }> {
  const monthPattern = /^\d{4}-\d{2}$/;
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  const targetMonth = monthPattern.test(month || "") ? String(month) : currentMonth;
  const { start, end } = getMonthBounds(targetMonth);

  const { rows } = await db.query<{ date: unknown; attendance: string }>(
    "SELECT date, attendance FROM attendance_history WHERE student_id = $1 AND date >= $2::date AND date < $3::date ORDER BY date",
    [studentId, start, end]
  );

  const records = rows.map((row) => ({
    date: formatDateOnly(row.date),
    attendance: row.attendance,
  }));

  return { ok: true, month: targetMonth, records };
}

export async function getStudentProfileService(
  studentId: string
): Promise<
  | { ok: true; student: { id: UserId; firstname: string; lastname: string } }
  | { ok: false; status: 404; message: string }
> {
  const { rows } = await db.query<{ id: UserId; firstname: string; lastname: string }>(
    "SELECT id, firstname, lastname FROM users WHERE id = $1 AND role = 'student'",
    [studentId]
  );

  if (rows.length === 0) {
    return { ok: false, status: 404, message: "Сурагч олдсонгүй" };
  }

  return { ok: true, student: rows[0] };
}

export async function changePasswordService(
  studentId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { rows } = await db.query<{ password: unknown }>(
    "SELECT password FROM users WHERE id = $1 AND role = 'student'",
    [studentId]
  );

  if (rows.length === 0) {
    return { ok: false, message: "Сурагч олдсонгүй" };
  }

  if (!(await verifyPassword(oldPassword, rows[0].password))) {
    return { ok: false, message: "Нууц үг буруу байна" };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.query("UPDATE users SET password = $1 WHERE id = $2", [
    passwordHash,
    studentId,
  ]);
  return { ok: true };
}


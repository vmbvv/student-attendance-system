import { db } from "../db.js";

function getMonthBounds(month) {
  // YYYY-MM; [start, end) bounds.
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

function formatDateOnly(value) {
  if (value instanceof Date) {
    const d = new Date(value);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

export async function getMyAttendanceService(studentId, month) {
  const monthPattern = /^\d{4}-\d{2}$/;
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  const targetMonth = monthPattern.test(month || "") ? month : currentMonth;
  const { start, end } = getMonthBounds(targetMonth);

  const { rows } = await db.query(
    "SELECT date, attendance FROM attendance_history WHERE student_id = $1 AND date >= $2::date AND date < $3::date ORDER BY date",
    [studentId, start, end]
  );

  const records = rows.map((row) => ({
    date: formatDateOnly(row.date),
    attendance: row.attendance,
  }));

  return { ok: true, month: targetMonth, records };
}

export async function getStudentProfileService(studentId) {
  const { rows } = await db.query(
    "SELECT id, firstname, lastname FROM users WHERE id = $1 AND role = 'student'",
    [studentId]
  );

  if (rows.length === 0) {
    return { ok: false, status: 404, message: "Сурагч олдсонгүй" };
  }

  return { ok: true, student: rows[0] };
}

export async function changePasswordService(
  studentId,
  oldPassword,
  newPassword
) {
  // Оруулсан нууц үг таарч байгаа эсэхийг шалгах
  const { rows } = await db.query(
    "SELECT password FROM users WHERE id = $1 AND role = 'student'",
    [studentId]
  );

  if (rows.length === 0) {
    return { ok: false, message: "Сурагч олдсонгүй" };
  }

  if (rows[0].password !== oldPassword) {
    return { ok: false, message: "Нууц үг буруу байна" };
  }

  await db.query("UPDATE users SET password = $1 WHERE id = $2", [
    newPassword,
    studentId,
  ]);
  return { ok: true };
}

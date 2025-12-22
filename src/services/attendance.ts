import { db } from "../db.js";

type UserId = string | number;

export type AttendanceStatus = "present" | "absent" | "excused";

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

export async function upsertAttendanceService(
  teacherId: string,
  studentId: string,
  date: string,
  attendance: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const student = await db.query<{ teacher_id: UserId }>(
    "SELECT teacher_id FROM users WHERE id = $1 AND role = 'student'",
    [studentId]
  );

  if (student.rows.length === 0) {
    return { ok: false, message: "Сурагч олдсонгүй" };
  }

  if (String(student.rows[0].teacher_id) !== String(teacherId)) {
    return { ok: false, message: "Сурагч тухайн багшид харьяалагдаггүй" };
  }

  const allowedValues: AttendanceStatus[] = ["present", "absent", "excused"];
  if (!allowedValues.includes(attendance as AttendanceStatus)) {
    return { ok: false, message: "Буруу ирц оруулсан байна" };
  }

  await db.query(
    "INSERT INTO attendance_history (student_id, date, attendance) VALUES ($1, $2::date, $3::attendance) ON CONFLICT (student_id, date) DO UPDATE SET attendance = EXCLUDED.attendance",
    [studentId, date, attendance]
  );

  return { ok: true };
}

export async function getAttendanceByDateService(
  teacherId: string,
  date: string
): Promise<Array<{ id: UserId; firstname: string; lastname: string; attendance: string }>> {
  const { rows } = await db.query<{
    id: UserId;
    firstname: string;
    lastname: string;
    attendance: string;
  }>(
    "SELECT u.id, u.firstname, u.lastname, ah.attendance FROM attendance_history ah JOIN users u ON ah.student_id = u.id WHERE u.teacher_id = $1 AND ah.date::date = $2::date ORDER BY u.lastname, u.firstname",
    [teacherId, date]
  );
  return rows;
}

export interface TeacherSummaryRow {
  student_id: UserId;
  firstname: string;
  lastname: string;
  total_days: number;
  present_count: number;
  absent_count: number;
  excused_count: number;
  present_percent: number | null;
}

export interface PaginatedTeacherSummaryResult {
  items: TeacherSummaryRow[];
  total: number;
  page: number;
  limit: number;
}

export async function getTeacherSummaryService(
  teacherId: string,
  sort: string,
  page: number,
  limit: number
): Promise<PaginatedTeacherSummaryResult> {
  const sortOptions: Record<string, string> = {
    name: "lastname ASC, firstname ASC",
    present_percent: "present_percent DESC",
    present_count: "present_count DESC",
    total_days: "total_days DESC",
    absent_count: "absent_count DESC",
  };

  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 25;
  const requestedPage = Number.isFinite(page) ? Math.max(page, 1) : 1;

  const countResult = await db.query<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM v_student_attendance_summary WHERE teacher_id = $1",
    [teacherId]
  );
  const total = countResult.rows[0]?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / safeLimit) : 1;
  const safePage = Math.min(requestedPage, totalPages);
  const offset = (safePage - 1) * safeLimit;

  const baseOrderBy = sortOptions[sort || ""] || "lastname ASC, firstname ASC";
  const orderBy = `${baseOrderBy}, student_id ASC`;

  const { rows } = await db.query<TeacherSummaryRow>(
    `SELECT student_id, firstname, lastname, total_days, present_count, absent_count, excused_count, present_percent FROM v_student_attendance_summary WHERE teacher_id = $1 ORDER BY ${orderBy} LIMIT $2 OFFSET $3`,
    [teacherId, safeLimit, offset]
  );

  return { items: rows, total, page: safePage, limit: safeLimit };
}

export async function getStudentAttendanceHistoryService(
  teacherId: string,
  studentId: string,
  month?: string
): Promise<
  | {
      ok: true;
      month: string;
      student: { id: UserId; firstname: string; lastname: string };
      records: Array<{ date: string; attendance: string }>;
    }
  | { ok: false; status: 404 | 403; message: string }
> {
  const monthPattern = /^\d{4}-\d{2}$/;
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  const targetMonth = monthPattern.test(month || "") ? String(month) : currentMonth;
  const { start, end } = getMonthBounds(targetMonth);

  const student = await db.query<{
    id: UserId;
    teacher_id: UserId;
    firstname: string;
    lastname: string;
  }>(
    "SELECT id, teacher_id, firstname, lastname FROM users WHERE id = $1 AND role = 'student'",
    [studentId]
  );

  if (student.rows.length === 0) {
    return { ok: false, status: 404, message: "Сурагч олдсонгүй" };
  }

  if (String(student.rows[0].teacher_id) !== String(teacherId)) {
    return {
      ok: false,
      status: 403,
      message: "Сурагч тухайн багшид харьяалалгүй",
    };
  }

  const { rows } = await db.query<{ date: unknown; attendance: string }>(
    "SELECT date, attendance FROM attendance_history WHERE student_id = $1 AND date >= $2::date AND date < $3::date ORDER BY date",
    [studentId, start, end]
  );

  const records = rows.map((row) => ({
    date: formatDateOnly(row.date),
    attendance: row.attendance,
  }));

  return {
    ok: true,
    month: targetMonth,
    student: {
      id: student.rows[0].id,
      firstname: student.rows[0].firstname,
      lastname: student.rows[0].lastname,
    },
    records,
  };
}

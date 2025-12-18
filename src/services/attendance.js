import { db } from "../db.js";

export async function upsertAttendanceService(
  teacherId,
  studentId,
  date,
  attendance
) {
  // Зөвхөн тухайн багш өөрт харьяалагдах сурагчдийн ирцийг бүртгэх.
  const student = await db.query(
    "SELECT teacher_id FROM users WHERE id = $1 AND role = 'student'",
    [studentId]
  );

  if (student.rows.length === 0) {
    return { ok: false, message: "Сурагч олдсонгүй" };
  }

  if (String(student.rows[0].teacher_id) !== String(teacherId)) {
    return { ok: false, message: "Сурагч тухайн багшид харьяалагдаггүй" };
  }

  const allowedValues = ["present", "absent", "excused"];
  if (!allowedValues.includes(attendance)) {
    return { ok: false, message: "Буруу ирц оруулсан байна" };
  }

  await db.query(
    "INSERT INTO attendance_history (student_id, date, attendance) VALUES ($1, $2::date, $3::attendance) ON CONFLICT (student_id, date) DO UPDATE SET attendance = EXCLUDED.attendance",
    [studentId, date, attendance]
  );

  return { ok: true };
}

export async function getAttendanceByDateService(teacherId, date) {
  const { rows } = await db.query(
    "SELECT u.id, u.firstname, u.lastname, ah.attendance FROM attendance_history ah JOIN users u ON ah.student_id = u.id WHERE u.teacher_id = $1 AND ah.date::date = $2::date ORDER BY u.lastname, u.firstname",
    [teacherId, date]
  );
  return rows;
}

export async function getTeacherSummaryService(teacherId, sort) {
  const sortOptions = {
    name: "lastname ASC, firstname ASC",
    present_percent: "present_percent DESC",
    present_count: "present_count DESC",
    total_days: "total_days DESC",
    absent_count: "absent_count DESC",
  };

  const orderBy = sortOptions[sort] || "lastname ASC, firstname ASC";
  const { rows } = await db.query(
    `SELECT student_id, firstname, lastname, total_days, present_count, absent_count, excused_count, present_percent FROM v_student_attendance_summary WHERE teacher_id = $1 ORDER BY ${orderBy}`,
    [teacherId]
  );
  return rows;
}

function getMonthBounds(month) {
  //YYYY-MM; [start, end) bounds
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

export async function getStudentAttendanceHistoryService(
  teacherId,
  studentId,
  month
) {
  const monthPattern = /^\d{4}-\d{2}$/;
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  const targetMonth = monthPattern.test(month || "") ? month : currentMonth;
  const { start, end } = getMonthBounds(targetMonth);

  const student = await db.query(
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

  const { rows } = await db.query(
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

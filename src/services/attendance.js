import { db } from "../db.js";

// export const upsertAttendanceService = async (teacherId, studentId, date, attendance) => {
//   const response = await db.guery(
//     'INSERT INTO users (teacherId, studentId, date, attendance) VALUES ($1, $2, $3, $4) RETURNING *',
//     [teacherId, studentId, date, attendance]
//   );
//   return response.rows[0];
//   // TODO: student тухайн багшийнх эсэхийг teacher_id-гаар баталгаажуулах
//   // TODO: attendance_history дээр (student_id, date) UPSERT хийх
//   return { ok: false, todo: true };
// };
// export async function getAttendanceByDateService(teacherId, date) {
//   // TODO: тухайн өдрийн ирцийг teacher_id-гаар шүүж, сурагчийн нэртэй хамт буцаах
//   // TODO: SELECT u.id, u.firstname, u.lastname, ah.attendance FROM attendance_history ah JOIN users u ON ah.student_id = u.id WHERE u.teacher_id = $1 AND ah.date = $2
//   return [];
// }

// export async function getTeacherSummaryService(teacherId, sort) {
//   // TODO: v_student_attendance_summary харагдацаас teacher_id-гаар шүүж, sort параметр байвал ашиглах
//   return [];
// }

// export const upsertAttendanceService = async (teacherId, studentId, date, attendance) => {
//   // Herev bagshid oyutan hariyalagdaj baiwal
//   const studentCheck = await db.query(
//     'SELECT 1 FROM users WHERE id = $1 AND teacher_id = $2',
//     [studentId, teacherId]
//   );

//   if (studentCheck.rows.length === 0) {
//     throw new Error('Student does not belong to this teacher');
//   }

//   // Upsert attendance in the attendance_history table
//   const response = await db.query(
//     `INSERT INTO attendance_history (teacher_id, student_id, date, attendance) 
//      VALUES ($1, $2, $3, $4) 
//      ON CONFLICT (student_id, date) 
//      DO UPDATE SET attendance = EXCLUDED.attendance 
//      RETURNING *`,
//     [teacherId, studentId, date, attendance]
//   );
  
//   return response.rows[0];
// };


export const upsertAttendanceService = async (teacherId, studentId, date, attendance) => {
  // Herev bagshid oyutan hariyalagdaj baiwal
  const studentCheck = await db.query(
    'SELECT 1 FROM users WHERE id = $1 AND teacher_id = $2',
    [studentId, teacherId]
  );

  if (studentCheck.rows.length === 0) {
    throw new Error('Ene bagshid oyutan hariyalagdahgvi bna');
  }

  // Upsert attendance in the attendance_history table
  const response = await db.query(
    `INSERT INTO attendance_history (teacher_id, student_id, date, attendance) 
     VALUES ($1, $2, $3, $4) 
     ON CONFLICT (student_id, date) 
     DO UPDATE SET attendance = EXCLUDED.attendance 
     RETURNING *`,
    [teacherId, studentId, date, attendance]
  );
  
  return response.rows[0];
};


export async function getAttendanceByDateService(teacherId, date) {
  const response = await db.query(
    `SELECT u.id, u.firstname, u.lastname, ah.attendance 
     FROM attendance_history ah 
     JOIN users u ON ah.student_id = u.id 
     WHERE u.teacher_id = $1 AND ah.date = $2`,
    [teacherId, date]
  );

  return response.rows;
}


export async function getTeacherSummaryService(teacherId, sort) {
  let query = `SELECT * FROM v_student_attendance_summary WHERE teacher_id = $1`;
  
  if (sort) {
    query += ` ORDER BY ${sort}`;
  }

  const response = await db.query(query, [teacherId]);
  return response.rows;
}






import { db } from "../db.js";

export async function getMyAttendanceService(studentId) {
  // TODO: attendance_history хүснэгтээс тухайн сурагчийн бүх өдрийн ирцийг авах

  const response = await db.query("SELECT * FROM users");
  return response.rows;
  return [];
}

export const updateStudentService = async (
  Studentid,
  StudentCode,
  Irsen,
  Hotsorson,
  Tasalsan,
  Chuluutei,
) => {
  const response = await db.query(
    `UPDATE users SET Student id = ${Studentid}, Studentcode = ${Studentcode}, Irsen = ${Irsen}, Hotsorson = ${Hotsorson}, Tasalsan = ${Tasalsan}  Chuluutei =${Chuluutei} WHERE id = ${id} RETURNING *`,
  );
  return response.rows[0];
};

export const getUserByIdService = async (id) => {
  const response = await db.query(`SELECT * FROM users WHERE id = ${id}`);
  return response.rows[0];
};
export async function changePasswordService(studentId, oldPassword, newPassword) {
   
  const response = await db.query(
    `UPDATE users SET studentid = ${studentid}, Studentcode =${Studentcode}, oldPassword = ${oldPassword}, newPassword = ${newPassword}, WHERE id = ${id} RETURNING *`,
  );
  return response.rows[0];
};
  // TODO: хуучин нууц үг таарч байгааг шалгаад UPDATE users SET password = $1 WHERE id = $2 хийх
  return { ok: false, todo: true };


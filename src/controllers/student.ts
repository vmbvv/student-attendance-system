import {
  getMyAttendanceService,
  changePasswordService,
  getStudentProfileService,
} from "../services/student.js";

function verifyStudentCookie(req, res, studentId) {
  const cookieStudentId = req.cookies?.studentId;
  if (!cookieStudentId || String(cookieStudentId) !== String(studentId)) {
    res.status(401).json({
      ok: false,
      message: "Сурагчийн cookie буруу байна",
    });
    return false;
  }
  return true;
}

export async function getMyAttendance(req, res) {
  const { studentId } = req.params;
  if (!verifyStudentCookie(req, res, studentId)) return;

  try {
    const { month } = req.query;
    const result = await getMyAttendanceService(studentId, month);
    return res.json(result);
  } catch (err) {
    console.error("Ирц ачаалахад алдаа гарлаа", err);
    return res
      .status(500)
      .json({ ok: false, message: "Ирц ачаалахад алдаа гарлаа" });
  }
}

export async function changePassword(req, res) {
  const { studentId } = req.params;
  const { oldPassword, newPassword } = req.body;
  if (!verifyStudentCookie(req, res, studentId)) return;

  try {
    const result = await changePasswordService(
      studentId,
      oldPassword,
      newPassword
    );
    const status = result.ok === false ? 400 : 200;
    return res.status(status).json(result);
  } catch (err) {
    console.error("Нууц үг өөрчлөхөд алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function getStudentProfile(req, res) {
  const { studentId } = req.params;
  if (!verifyStudentCookie(req, res, studentId)) return;

  try {
    const result = await getStudentProfileService(studentId);
    if (result.ok === false) {
      const status = result.status || 400;
      return res.status(status).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("Алдаа гарлаа", err);
    return res.status(500).json({
      ok: false,
      message: "Серверт алдаа гарлаа",
    });
  }
}

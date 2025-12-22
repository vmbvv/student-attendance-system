import {
  getMyAttendanceService,
  changePasswordService,
  getStudentProfileService,
} from "../services/student.js";

export async function getMyAttendance(req, res) {
  const { studentId } = req.params;

  try {
    const { month } = req.query;
    const result = await getMyAttendanceService(studentId, month);
    return res.json(result);
  } catch (err) {
    console.error("Failed to load attendance", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function changePassword(req, res) {
  const { studentId } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const result = await changePasswordService(
      studentId,
      oldPassword,
      newPassword
    );
    const status = result.ok === false ? 400 : 200;
    return res.status(status).json(result);
  } catch (err) {
    console.error("Failed to change password", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function getStudentProfile(req, res) {
  const { studentId } = req.params;

  try {
    const result = await getStudentProfileService(studentId);
    if (result.ok === false) {
      const status = result.status || 400;
      return res.status(status).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("Failed to load student profile", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}


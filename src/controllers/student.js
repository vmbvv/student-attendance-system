import {
  getMyAttendanceService,
  changePasswordService,
} from "../services/student.js";

export async function getMyAttendance(req, res) {
  const { studentId } = req.params;
  // TODO: сурагч зөвхөн өөрийн мэдээллийг авах эсэхийг cookie-оос шалгах
  const result = await getMyAttendanceService(studentId);
  return res.json(result);
}

export async function changePassword(req, res) {
  const { studentId } = req.params;
  const { oldPassword, newPassword } = req.body;
  // TODO: нууц үг таарч байгааг шалгаад дараа нь шинэ нууц үгийг хадгалах
  const result = await changePasswordService(studentId, oldPassword, newPassword);
  return res.json(result);
}

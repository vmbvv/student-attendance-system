import {
  getStudentsService,
  createStudentService,
  deleteStudentService,
  getTeacherProfileService,
} from "../services/teacher.js";

function verifyTeacherCookie(req, res, teacherId) {
  const cookieTeacherId = req.cookies?.teacherId;
  if (!cookieTeacherId || String(cookieTeacherId) !== String(teacherId)) {
    res.status(401).json({
      ok: false,
      message: "Багшийн cookie буруу байна",
    });
    return false;
  }
  return true;
}

export async function getStudents(req, res) {
  const { teacherId } = req.params;
  if (!verifyTeacherCookie(req, res, teacherId)) return;

  try {
    const { search } = req.query;
    const result = await getStudentsService(teacherId, search);
    return res.json(result);
  } catch (err) {
    console.error("Сурагчдийг ачаалахад алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function createStudent(req, res) {
  const { teacherId } = req.params;
  if (!verifyTeacherCookie(req, res, teacherId)) return;

  try {
    const { firstname, lastname, age, password } = req.body;
    // Зөвхөн тухайн багш өөрт харьяалагдах сурагч нэмэх
    const result = await createStudentService(
      teacherId,
      firstname,
      lastname,
      age,
      password
    );
    return res.json(result);
  } catch (err) {
    console.error("Сурагч нэмэхэд алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function deleteStudent(req, res) {
  const { teacherId, studentId } = req.params;
  if (!verifyTeacherCookie(req, res, teacherId)) return;

  try {
    // Бусад багшийн сурагчдийг устгахаас хамгаалах
    const result = await deleteStudentService(teacherId, studentId);
    const status = result.ok === false ? 404 : 200;
    return res.status(status).json(result);
  } catch (err) {
    console.error("Сурагч хасахад алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function getTeacherProfile(req, res) {
  const { teacherId } = req.params;
  if (!verifyTeacherCookie(req, res, teacherId)) return;

  try {
    const result = await getTeacherProfileService(teacherId);
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

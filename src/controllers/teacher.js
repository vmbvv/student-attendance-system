import {
  getStudentsService,
  createStudentService,
  deleteStudentService,
  getTeacherProfileService,
} from "../services/teacher.js";

export async function getStudents(req, res) {
  const { teacherId } = req.params;

  try {
    const { search } = req.query;
    const result = await getStudentsService(teacherId, search);
    return res.json(result);
  } catch (err) {
    console.error("Failed to fetch students", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function createStudent(req, res) {
  const { teacherId } = req.params;

  try {
    const { firstname, lastname, age, password } = req.body;
    const result = await createStudentService(
      teacherId,
      firstname,
      lastname,
      age,
      password
    );
    return res.json(result);
  } catch (err) {
    console.error("Failed to create student", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function deleteStudent(req, res) {
  const { teacherId, studentId } = req.params;

  try {
    const result = await deleteStudentService(teacherId, studentId);
    const status = result.ok === false ? 404 : 200;
    return res.status(status).json(result);
  } catch (err) {
    console.error("Failed to delete student", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

export async function getTeacherProfile(req, res) {
  const { teacherId } = req.params;

  try {
    const result = await getTeacherProfileService(teacherId);
    if (result.ok === false) {
      const status = result.status || 400;
      return res.status(status).json(result);
    }
    return res.json(result);
  } catch (err) {
    console.error("Failed to load teacher profile", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}


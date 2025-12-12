import {
  getStudentsService,
  createStudentService,
  deleteStudentService,
} from "../services/teacher.js";

export async function getStudents(req, res) {
  const { teacherId } = req.params;
  const { search } = req.query;
  const result = await getStudentsService(teacherId, search);
  return res.json(result);
}

export async function createStudent(req, res) {
  const { teacherId } = req.params;
  const { firstname, lastname, age, password } = req.body;
  // TODO: багш зөвхөн өөрийн сурагчдыг үүсгэх эрхтэй эсэхийг cookie-оос шалгах
  const result = await createStudentService(teacherId, firstname, lastname, age, password);
  return res.json(result);
}

export async function deleteStudent(req, res) {
  const { teacherId, studentId } = req.params;
  // TODO: устгах сурагч тухайн багшийнх эсэхийг cookie-оор шалгах
  const result = await deleteStudentService(teacherId, studentId);
  return res.json(result);
}

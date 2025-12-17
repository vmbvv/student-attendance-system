import {
  getStudentsService,
  getStudentService,
  createStudentService,
  deleteStudentService,
} from "../services/teacher.js";

export const getStudents = async (req, res) => {
  const { teacher_id } = req.params;
  const result = await getStudentsService(teacher_id);
  return res.json(result);
};
export const getStudent = async (req, res) => {
  const { teacher_id, id } = req.params;
  const result = await getStudentService(id, teacher_id);
  return res.json(result);
};

export const createStudent = async (req, res) => {
  const { teacher_id } = req.params;
  const { firstname, lastname, age, password } = req.body;

  const result = await createStudentService(
    teacher_id,
    firstname,
    lastname,
    age,
    password
  );
  return res.json(result);
};

export const deleteStudent = async (req, res) => {
  const { teacher_id, id } = req.params;
  // TODO: устгах сурагч тухайн багшийнх эсэхийг cookie-оор шалгах
  const result = await deleteStudentService(teacher_id, id);
  return res.json(result);
};

import {
  registerTeacherService,
  loginTeacherService,
  loginStudentService,
  logoutService,
} from "../services/user.js";

export async function registerTeacher(req, res) {
  const { firstname, lastname, age, password } = req.body;
  const result = await registerTeacherService(firstname, lastname, age, password);
  return res.json(result);
}

export async function loginTeacher(req, res) {
  const { id, password } = req.body;
  // TODO: login амжилттай бол багшийн cookie тохируулах (document.cookie / res.cookie ашиглах)
  const result = await loginTeacherService(id, password);
  return res.json(result);
}

export async function loginStudent(req, res) {
  const { id, password } = req.body;
  // TODO: login амжилттай бол сурагчийн cookie тохируулах (document.cookie / res.cookie ашиглах)
  const result = await loginStudentService(id, password);
  return res.json(result);
}

export async function logout(req, res) {
  // TODO: logout хийхэд cookie-г арилгах (res.clearCookie / document.cookie)
  const result = await logoutService();
  return res.json(result);
}

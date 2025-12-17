import {
  registerTeacherService,
  loginTeacherService,
  loginStudentService,
  logoutService,
} from "../services/user.js";

const authCookieOptions = {
  httpOnly: false,
  sameSite: "lax",
  path: "/",
};

export async function registerTeacher(req, res) {
  try {
    const { firstname, lastname, age, password } = req.body;
    const result = await registerTeacherService(
      firstname,
      lastname,
      age,
      password
    );
    return res.json(result);
  } catch (err) {
    console.error("Багшыг бүртгүүлэхэд алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function loginTeacher(req, res) {
  try {
    const { id, password } = req.body;
    //  login амжилттай бол багшийн cookie тохируулах (document.cookie / res.cookie ашиглах)
    const result = await loginTeacherService(id, password);

    if (!result.ok) {
      return res.status(401).json(result);
    }

    res.clearCookie("studentId", authCookieOptions);
    res.cookie("teacherId", result.id, authCookieOptions);

    return res.json(result);
  } catch (err) {
    console.error("Багш нэвтрэхэд алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function loginStudent(req, res) {
  try {
    const { id, password } = req.body;
    //  login амжилттай бол сурагчийн cookie тохируулах (document.cookie / res.cookie ашиглах)
    const result = await loginStudentService(id, password);

    if (!result.ok) {
      return res.status(401).json(result);
    }

    res.clearCookie("teacherId", authCookieOptions);
    res.cookie("studentId", result.id, authCookieOptions);

    return res.json(result);
  } catch (err) {
    console.error("Сурагч нэвтрэхэд алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

export async function logout(req, res) {
  //  logout хийхэд cookie-г арилгах (res.clearCookie / document.cookie)
  try {
    res.clearCookie("teacherId", authCookieOptions);
    res.clearCookie("studentId", authCookieOptions);
    const result = await logoutService();
    return res.json(result);
  } catch (err) {
    console.error("Системээс гарахад алдаа гарлаа", err);
    return res.status(500).json({ ok: false, message: "Серверт алдаа гарлаа" });
  }
}

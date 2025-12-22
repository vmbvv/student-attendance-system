import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  registerTeacher,
  loginTeacher,
  loginStudent,
  logout,
} from "../controllers/user.js";

export const userRouters = Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Хэт олон оролдлого. Дараа дахин оролдоно уу." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Хэт олон оролдлого. Дараа дахин оролдоно уу." },
});

userRouters.post("/register-teacher", registerLimiter, registerTeacher);
userRouters.post("/login-teacher", loginLimiter, loginTeacher);
userRouters.post("/login-student", loginLimiter, loginStudent);
userRouters.post("/logout", logout);

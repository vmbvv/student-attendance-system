import { Router } from "express";
import {
  registerTeacher,
  loginTeacher,
  loginStudent,
  logout,
} from "../controllers/user.js";

export const userRouters = new Router();

userRouters.post("/register-teacher", registerTeacher);
userRouters.post("/login-teacher", loginTeacher);
userRouters.post("/login-student", loginStudent);
userRouters.post("/logout", logout);

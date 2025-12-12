import { Router } from "express";
import {
  getMyAttendance,
  changePassword,
} from "../controllers/student.js";

export const studentRouters = new Router();

studentRouters.get("/:studentId/attendance", getMyAttendance);
studentRouters.patch("/:studentId/password", changePassword);

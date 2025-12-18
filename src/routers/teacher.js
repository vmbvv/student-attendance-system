import { Router } from "express";
import {
  getStudents,
  getStudent,
  createStudent,
  deleteStudent,
} from "../controllers/teacher.js";
import {
  upsertAttendance,
  getAttendanceByDate,
  getTeacherSummary,
} from "../controllers/attendance.js";

export const teacherRouters = new Router();
teacherRouters.get("/students", getStudents);
teacherRouters.get("/student/:teacher_id/:id", getStudent);
teacherRouters.post("/student/:teacher_id/createStudent", createStudent);
teacherRouters.delete("/:teacherId/students/:id", deleteStudent);
teacherRouters.put("/:teacherId/attendance", upsertAttendance);
teacherRouters.get("/:teacherId/attendance", getAttendanceByDate);
teacherRouters.get("/:teacherId/summary", getTeacherSummary);

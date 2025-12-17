import { Router } from "express";
import {
  getStudents,
  createStudent,
  deleteStudent,
  getStudent,
} from "../controllers/teacher.js";
import {
  upsertAttendance,
  getAttendanceByDate,
  getTeacherSummary,
} from "../controllers/attendance.js";

export const teacherRouters = new Router();
teacherRouters.get("/students", getStudents);
teacherRouters.get("/student/:teacher_id/:id", getStudent);
teacherRouters.post("/:teacherId/createStudent", createStudent);
teacherRouters.delete("/:teacherId/students/:studentId", deleteStudent);
teacherRouters.put("/:teacherId/attendance", upsertAttendance);
teacherRouters.get("/:teacherId/attendance", getAttendanceByDate);
teacherRouters.get("/:teacherId/summary", getTeacherSummary);

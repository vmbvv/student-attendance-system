const studentsList = document.getElementById("students-list");
const searchForm = document.getElementById("search-form");
const addStudentForm = document.getElementById("add-student-form");
const addStudentStatus = document.getElementById("add-student-status");
const attendanceForm = document.getElementById("attendance-form");
const attendanceStatus = document.getElementById("attendance-status");
const attendanceList = document.getElementById("attendance-list");
const loadAttendanceBtn = document.getElementById("load-attendance");
const summaryList = document.getElementById("summary-list");
const loadSummaryBtn = document.getElementById("load-summary");

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // TODO: dashboard дээр cookie-оос teacherId-г уншаад API дуудлага хийх
  // TODO: search параметр байвал /teacher/:teacherId/students?search=... руу fetch хийх
  studentsList.textContent = "TODO: load students list";
});

addStudentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // TODO: fetch ашиглан /teacher/:teacherId/students руу POST хийж сурагч нэмэх
  addStudentStatus.textContent = "TODO: create student request";
});

attendanceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // TODO: fetch ашиглан /teacher/:teacherId/attendance руу PUT илгээж ирц хадгалах
  attendanceStatus.textContent = "TODO: save attendance request";
});

loadAttendanceBtn.addEventListener("click", () => {
  // TODO: cookie-оос teacherId авч, сонгосон өдрийн ирцийг /teacher/:teacherId/attendance?date=... дуудлагаар авах
  attendanceList.textContent = "";
  const placeholder = document.createElement("li");
  placeholder.textContent = "TODO: load attendance for selected date";
  attendanceList.appendChild(placeholder);
});

loadSummaryBtn.addEventListener("click", () => {
  // TODO: /teacher/:teacherId/summary дуудлага хийж v_student_attendance_summary харагдацаас мэдээлэл авах
  summaryList.textContent = "";
  const placeholder = document.createElement("li");
  placeholder.textContent = "TODO: load attendance summary";
  summaryList.appendChild(placeholder);
});

const attendanceList = document.getElementById("attendance-list");
const loadAttendanceBtn = document.getElementById("load-attendance");
const passwordForm = document.getElementById("password-form");
const passwordStatus = document.getElementById("password-status");

loadAttendanceBtn.addEventListener("click", () => {
  // TODO: cookie-оос studentId-г уншаад /student/:studentId/attendance руу GET хийх
  attendanceList.textContent = "";
  const placeholder = document.createElement("li");
  placeholder.textContent = "TODO: load my attendance";
  attendanceList.appendChild(placeholder);
});

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // TODO: cookie-оос studentId-г уншаад /student/:studentId/password руу PATCH илгээх
  // TODO: plain text нууц үгийг body дээр илгээж, backend дээр шалгах
  passwordStatus.textContent = "TODO: submit password change request";
});

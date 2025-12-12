const form = document.getElementById("login-form");
const statusEl = document.getElementById("status");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const role = form.role.value;
  const endpoint =
    role === "teacher" ? "/user/login-teacher" : "/user/login-student";

  const payload = {
    id: form.userId.value.trim(),
    password: form.password.value,
  };

  // TODO: fetch ашиглан endpoint рүү POST илгээж login хийх
  // TODO: login амжилттай бол сонгосон role-ийн id-г cookie дээр хадгалах (document.cookie)
  // TODO: teacher бол /teacher/dashboard.html, student бол /student/dashboard.html рүү шилжүүлэх
  statusEl.textContent = "TODO: implement combined login request";
});

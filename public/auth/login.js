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

  statusEl.textContent = "Нэвтэрч байна...";
  // fetch ашиглан endpoint рүү POST илгээж login хийх
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Нэвтрэхэд алдаа гарлаа");
      }

      const cookieName = role === "teacher" ? "teacherId" : "studentId";
      const clearName = role === "teacher" ? "studentId" : "teacherId";
      // login амжилттай бол сонгосон role-ийн id-г cookie дээр хадгалах (document.cookie)

      document.cookie = `${cookieName}=${data.id}; path/; SameSite=Lax`;
      document.cookie = `${clearName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;

      // teacher бол /teacher/dashboard.html, student бол /student/dashboard.html рүү шилжүүлэх
      window.location.href =
        role === "teacher"
          ? "/teacher/dashboard.html"
          : "/student/dashboard.html";
    })
    .catch((err) => {
      statusEl.textContent =
        err.message || "Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу";
    });
});

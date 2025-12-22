const form = document.getElementById("register-form");
const result = document.getElementById("result");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  if (password !== confirmPassword) {
    result.textContent = "Нууц үг таарахгүй байна";
    return;
  }

  const payload = {
    firstname: form.firstname.value.trim(),
    lastname: form.lastname.value.trim(),
    password,
    confirmPassword,
  };

  const registrationToken = form.registrationToken?.value?.trim();
  if (registrationToken) {
    payload.registrationToken = registrationToken;
  }

  // fetch ашиглан /user/register-teacher рүү POST илгээх
  result.textContent = "Аккоунт үүсгэж байна...";

  fetch("/user/register-teacher", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Бүртгэлд алдаа гарлаа");
      }
      // Нэвтрэхэд ашиглах багшийн шинээр үүссэн ID харуулах
      result.textContent = `Таны шинэ аккоунт үүслээ. Дараах ID нэвтрэх үед ашиглагдах тул тэмдэглэж авна уу! Багшийн ID: ${data.id}`;
      form.reset();
    })
    .catch((err) => {
      result.textContent = err.message || "Бүртгэл хийх боломжгүй байна";
    });
});

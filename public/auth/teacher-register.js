const form = document.getElementById("register-form");
const result = document.getElementById("result");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const payload = {
    firstname: form.firstname.value.trim(),
    lastname: form.lastname.value.trim(),
    age: form.age.value ? Number(form.age.value) : null,
    password: form.password.value,
  };

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
        throw new Error(data.message || "Бүргэлд алдаа гарлаа");
      }
      // Нэвтрэхэд ашиглах багшийн шинээр үүссэн ID харуулах
      result.textContent = `Таны шинэ аккоунт үүслээ. Дараах ID нэвтрэх үед ашиглагдах тул тэмдэглэж авна уу! Багшийн ID: ${data.id}`;
      form.reset();
    })
    .catch((err) => {
      result.textContent = err.message || "Бүртгэл хийх боломжгүй байна";
    });
});

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

  // TODO: fetch ашиглан /user/register-teacher рүү POST илгээх
  result.textContent = "TODO: implement teacher registration request";
});

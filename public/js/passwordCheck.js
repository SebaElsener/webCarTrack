userPassCheck.addEventListener("change", () => {
  const userPass = document.getElementById("userPass");
  const userPassCheck = document.getElementById("userPassCheck");
  const errorPassCheck = document.getElementById("errorPassCheck");
  const sendBtn = document.getElementById("sendBtn");
  if (userPass.value !== userPassCheck.value) {
    errorPassCheck.style.display = "block";
  } else {
    errorPassCheck.style.display = "none";
    sendBtn.disabled = false;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("userName");
  const ageInput = document.getElementById("age");
  const submitBtn = document.getElementById("sendBtn");

  const emailError = document.getElementById("emailError");
  const ageError = document.getElementById("ageError");

  function validateEmail() {
    const value = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    emailInput.classList.toggle("input-valid", valid);
    emailInput.classList.toggle("input-invalid", !valid);
    emailError.style.display = valid ? "none" : "block";

    return valid;
  }

  function validateAge() {
    const age = parseInt(ageInput.value, 10);
    const valid = !isNaN(age) && age >= 18 && age <= 90;

    ageInput.classList.toggle("input-valid", valid);
    ageInput.classList.toggle("input-invalid", !valid);
    ageError.style.display = valid ? "none" : "block";

    return valid;
  }

  function validateForm() {
    const emailOk = validateEmail();
    const ageOk = validateAge();

    submitBtn.disabled = !(emailOk && ageOk);
  }

  emailInput.addEventListener("input", validateForm);
  ageInput.addEventListener("input", validateForm);
});

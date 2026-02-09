document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("userName");
  const passInput = document.getElementById("userPass");
  const submitBtn = document.querySelector("#loginForm button[type='submit']");

  const emailError = document.getElementById("loginEmailError");
  const passError = document.getElementById("loginPassError");

  function validateEmail() {
    const value = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    emailInput.classList.toggle("input-valid", valid);
    emailInput.classList.toggle("input-invalid", !valid);
    emailError.style.display = valid ? "none" : "block";

    return valid;
  }

  function validatePassword() {
    const valid = passInput.value.trim().length > 0;

    passInput.classList.toggle("input-valid", valid);
    passInput.classList.toggle("input-invalid", !valid);
    passError.style.display = valid ? "none" : "block";

    return valid;
  }

  function validateForm() {
    const emailOk = validateEmail();
    const passOk = validatePassword();

    submitBtn.disabled = !(emailOk && passOk);
  }

  emailInput.addEventListener("input", validateForm);
  passInput.addEventListener("input", validateForm);

  // estado inicial
  submitBtn.disabled = true;
});

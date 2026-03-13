const userPass = document.getElementById("userPass");
const userPassCheck = document.getElementById("userPassCheck");

function checkPasswords() {
  const errorPassCheck = document.getElementById("errorPassCheck");
  const errorValidPass = document.getElementById("errorValidPass");
  const sendBtn = document.getElementById("sendBtn");

  // Validar contraseña fuerte
  if (!validatePassword(userPass.value)) {
    errorValidPass.style.display = "block";
    sendBtn.disabled = true;
    return;
  } else {
    errorValidPass.style.display = "none";
  }

  // Validar coincidencia
  if (userPass.value !== userPassCheck.value) {
    errorPassCheck.style.display = "block";
    sendBtn.disabled = true;
  } else {
    errorPassCheck.style.display = "none";
    sendBtn.disabled = false;
  }
}

userPass.addEventListener("input", checkPasswords);
userPassCheck.addEventListener("input", checkPasswords);

function validatePassword(password) {
  const strong =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  return strong;
}

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("userName");
  const submitBtn = document.getElementById("sendBtn");

  const emailError = document.getElementById("emailError");

  function validateEmail() {
    const value = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    emailInput.classList.toggle("input-valid", valid);
    emailInput.classList.toggle("input-invalid", !valid);
    emailError.style.display = valid ? "none" : "block";

    return valid;
  }

  function validateForm() {
    const emailOk = validateEmail();

    submitBtn.disabled = !emailOk;
  }

  emailInput.addEventListener("input", validateForm);
});

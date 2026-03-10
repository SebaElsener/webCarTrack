import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://gfwzalwdhgramkwdxlbq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_L-wOKzhIj1yuKIkLqpz4wA_f-rBC3HZ";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("userName");
  const passInput = document.getElementById("userPass");
  const submitBtn = document.querySelector("#loginForm button[type='submit']");

  const emailError = document.getElementById("loginEmailError");
  const passError = document.getElementById("loginPassError");

  // -----------------------
  // VALIDACIONES UX
  // -----------------------

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

  submitBtn.disabled = true;

  // -----------------------
  // LOGIN REAL CON SUPABASE
  // -----------------------

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    //if (!validateForm()) return;

    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    const spinner = document.getElementById("loginSpinner");
    const text = document.getElementById("loginText");

    submitBtn.disabled = true;

    let spinnerVisible = false;

    const spinnerTimer = setTimeout(() => {
      spinner.classList.remove("d-none");
      text.textContent = "Ingresando...";
      spinnerVisible = true;
    }, 300);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      clearTimeout(spinnerTimer);

      if (spinnerVisible) {
        spinner.classList.add("d-none");
      }

      text.textContent = "Enviar";

      passError.style.display = "block";
      passError.innerText = "Usuario o contraseña incorrectos";
      submitBtn.disabled = false;

      return;
    }

    const token = data.session.access_token;

    await fetch("/api/home", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    await supabase.auth.signOut();

    // Redirigir a home
    clearTimeout(spinnerTimer);
    window.location.href = "/api/home";
  });
});

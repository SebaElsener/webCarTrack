export function initVINValidation({
  formId,
  inputId,
  errorId,
  onValidSubmit,
  minLength = 3,
}) {
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);

  if (!form || !input) return;

  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;

  function actualizarEstado(value) {
    // vacío
    if (!value) {
      input.classList.remove("is-valid", "is-invalid");
      if (errorEl) errorEl.textContent = "";
      return false;
    }

    // menor al mínimo
    if (value.length < minLength) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");

      if (errorEl) {
        errorEl.textContent = `Ingrese al menos ${minLength} caracteres`;
      }

      return false;
    }

    // válido para búsqueda
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");

    // detectar VIN completo válido
    if (vinRegex.test(value)) {
      if (errorEl) {
        errorEl.textContent = "VIN completo detectado";
      }
    } else {
      if (errorEl) {
        errorEl.textContent = "";
      }
    }

    return true;
  }

  // 🔠 Normalizar + live validation
  input.addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase().trim();
    actualizarEstado(e.target.value);
  });

  // 🚀 Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const value = input.value.trim().toUpperCase();

    if (!actualizarEstado(value)) return;

    if (typeof onValidSubmit === "function") {
      await onValidSubmit(value);
    }
  });
}

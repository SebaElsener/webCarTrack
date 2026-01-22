function setButtonLoading(button, loading, text = "Guardando...") {
  const textSpan = button.querySelector(".btn-text");

  if (loading) {
    button.disabled = true;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      ${text}
    `;
  } else {
    button.disabled = false;
    button.innerHTML = `<span class="btn-text">Guardar cambios</span>`;
  }
}

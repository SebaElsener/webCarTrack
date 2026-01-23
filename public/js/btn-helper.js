function setButtonLoading(button, loading, loadingText = "Procesando...") {
  if (!button) return;

  if (loading) {
    // guardar texto original solo una vez
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.innerHTML;
    }

    button.disabled = true;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      ${loadingText}
    `;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
}

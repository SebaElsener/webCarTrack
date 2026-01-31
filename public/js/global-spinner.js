function showGlobalSpinner(message = "Procesando...") {
  let overlay = document.getElementById("global-spinner");

  if (overlay) return;

  overlay = document.createElement("div");
  overlay.id = "global-spinner";
  overlay.innerHTML = `
    <div class="spinner-overlay">
      <div class="text-center">
        <div class="spinner-border text-danger mb-2" role="status"></div>
        <div class="fw-semibold">${message}</div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function hideGlobalSpinner() {
  document.getElementById("global-spinner")?.remove();
}

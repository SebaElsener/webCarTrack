function confirmModal({
  title = "Confirmar acción",
  body = "¿Estás seguro?",
  confirmText = "Confirmar",
  confirmClass = "btn-danger",
}) {
  return new Promise((resolve) => {
    const MODAL_ID = "confirmModalDynamic";

    let modalEl = document.getElementById(MODAL_ID);

    if (!modalEl) {
      modalEl = document.createElement("div");
      modalEl.id = MODAL_ID;
      modalEl.className = "modal fade";
      modalEl.tabIndex = -1;
      modalEl.setAttribute("data-bs-backdrop", "static");
      modalEl.setAttribute("data-bs-keyboard", "false");

      modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-cancel>
                Cancelar
              </button>
              <button type="button" class="btn" data-confirm>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modalEl);
    }

    modalEl.querySelector(".modal-title").textContent = title;
    modalEl.querySelector(".modal-body").innerHTML = body;

    const confirmBtn = modalEl.querySelector("[data-confirm]");
    const cancelBtn = modalEl.querySelector("[data-cancel]");

    confirmBtn.className = `btn ${confirmClass}`;
    confirmBtn.textContent = confirmText;

    // limpiar handlers previos
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;

    const modal = new bootstrap.Modal(modalEl);

    confirmBtn.onclick = () => {
      modal.hide();
      resolve(true);
    };

    cancelBtn.onclick = () => {
      modal.hide();
      resolve(false);
    };

    modal.show();
  });
}

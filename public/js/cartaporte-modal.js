function openCartaPorteModal(scan, bodyCartaPorte) {
  const MODAL_ID = "cartaPorteModal";

  let modalEl = document.getElementById(MODAL_ID);

  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = MODAL_ID;
    modalEl.className = "modal fade";
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Generar Carta de Porte</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            ${bodyCartaPorte}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-cancel>Cancelar</button>
            <button class="btn btn-primary" data-confirm disabled>
              Generar
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  const modal = new bootstrap.Modal(modalEl);
  const confirmBtn = modalEl.querySelector("[data-confirm]");
  const cancelBtn = modalEl.querySelector("[data-cancel]");

  // 🔁 reset estado
  confirmBtn.disabled = true;
  modalEl.querySelector("#cp-nro").value = "";
  modalEl.querySelector("#cp-error").classList.add("d-none");

  // 🧠 precarga
  if (scan) {
    modalEl.querySelector("#cp-destino").value = scan.lugar ?? "";
    modalEl.querySelector("#cp-fecha").value =
      scan.scan_date?.slice(0, 10) ?? "";
  }

  modalEl.oninput = () => {
    confirmBtn.disabled = !validarCartaPorte();
  };

  return new Promise((resolve) => {
    confirmBtn.onclick = () => {
      if (!validarCartaPorte()) return;
      modal.hide();
      resolve(getCartaPorteData());
    };

    cancelBtn.onclick = () => {
      modal.hide();
      resolve(null);
    };

    modal.show();
  });
}

function validarCartaPorte() {
  const { cartaPorte, destino, fechaRemito } = getCartaPorteData();
  const errorEl = document.getElementById("cp-error");

  const valido = cartaPorte && destino && fechaRemito;

  errorEl.classList.toggle("d-none", !!valido);
  return !!valido;
}

function getCartaPorteData() {
  return {
    cartaPorte: document.getElementById("cp-nro")?.value.trim(),
    destino: document.getElementById("cp-destino")?.value.trim(),
    fechaRemito: document.getElementById("cp-fecha")?.value,
  };
}

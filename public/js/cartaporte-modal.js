import { GetCartaporteInfo } from "./getCartaporteInfo";

const cartaporteInfo = new GetCartaporteInfo();

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

  modalEl.addEventListener("input", (e) => {
    const confirmBtn = modalEl.querySelector("[data-confirm]");
    confirmBtn.disabled = !validarCartaPorte(modalEl);
  });

  const modal = new bootstrap.Modal(modalEl);
  const confirmBtn = modalEl.querySelector("[data-confirm]");
  const cancelBtn = modalEl.querySelector("[data-cancel]");

  // 🔁 reset estado
  confirmBtn.disabled = true;
  modalEl.querySelector("#cp-nro").value = "";
  modalEl.querySelector("#cp-error").classList.add("d-none");

  // 🧠 precarga
  //   if (scan) {
  //     modalEl.querySelector("#cp-destino").value = scan.lugar ?? "";
  //     modalEl.querySelector("#cp-fecha").value =
  //       scan.scan_date?.slice(0, 10) ?? "";
  //   }

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

function validarCartaPorte(modalEl) {
  const nro = modalEl.querySelector("#cp-nro")?.value.trim();
  const fecha = modalEl.querySelector("#cp-fecha")?.value;

  const destinoOk = validarDestino(modalEl);

  const valido = !!(nro && fecha && destinoOk);

  const errorEl = modalEl.querySelector("#cp-error");
  errorEl.classList.toggle("d-none", valido);

  return valido;
}

function validarDestino(modalEl) {
  const input = modalEl.querySelector("#cp-destino");
  if (!input) return false;

  const value = input.value.trim();
  if (!value) {
    input.classList.remove("is-invalid");
    return false;
  }

  const destinoInfo = cartaporteInfo.destinationData(value);

  if (!destinoInfo) {
    input.classList.add("is-invalid");
    toastError("El destino ingresado no existe");
    return false;
  }

  input.classList.remove("is-invalid");
  return true;
}

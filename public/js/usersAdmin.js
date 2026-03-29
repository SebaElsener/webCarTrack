const navBarMin = document.getElementById("navBarMin");
navBarMin.style.top = "0";

const search = document.getElementById("userSearch");
const tbody = document.querySelector("tbody");
const toggle = document.getElementById("toggleTipo");
const usersFormTitle = document.querySelector(".usersFormTitle");
let currentMode = "users"; // users | transportistas
currentMode = toggle.checked ? "transportistas" : "users";

if (currentMode === "transportistas") {
  loadData();
}
const addBtn = document.getElementById("addBtn");
const col1 = document.getElementById("col1");
const col2 = document.getElementById("col2");
const initialUsers = JSON.parse(
  document.getElementById("initialUsersData").textContent,
);

window.initialUsers = initialUsers;

search.addEventListener("input", () => {
  const term = search.value.toLowerCase();

  document.querySelectorAll("tbody tr").forEach((row) => {
    let text = "";

    if (currentMode === "users") {
      text = row.children[0].textContent.toLowerCase();
    } else {
      const nbr = row.querySelector(".transportNbr")?.value || "";
      const name = row.querySelector(".transportName")?.value || "";

      text = (nbr + " " + name).toLowerCase();
    }

    row.style.display = text.includes(term) ? "" : "none";
  });
});

document.querySelectorAll(".roleSelect").forEach((select) => {
  select.addEventListener("change", async (e) => {
    const row = e.target.closest("tr");
    const userId = row.dataset.id;
    const roleId = e.target.value;

    const spinner = row.querySelector(".roleSpinner");

    spinner.classList.remove("d-none");

    try {
      const res = await fetch(`/api/userdata/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_id: roleId }),
      });

      if (!res.ok) {
        throw new Error();
      }

      showToast({
        text: "Rol actualizado",
        type: "success",
      });
    } catch (err) {
      console.error(err);

      showToast({
        text: "Error actualizando rol",
        type: "error",
      });
    } finally {
      spinner.classList.add("d-none");
    }
  });
});

document.querySelectorAll(".deleteUserBtn").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const userId = row.dataset.id;
    const email = row.children[0].textContent;

    const confirmed = await confirmModal({
      title: "Eliminar usuario",
      body: `Se eliminará el usuario <b>${email}</b><br><br>Esta acción no se puede deshacer.`,
      confirmText: "Eliminar usuario",
      confirmClass: "btn-danger",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/userdata/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error eliminando usuario");
      }

      row.remove();

      showToast({
        text: "Usuario eliminado",
        type: "success",
      });
    } catch (error) {
      showToast({
        text: error.message,
        type: "error",
      });
    }
  });
});

/// TRANSPORTISTAS ///
const label = document.querySelector("label[for='toggleTipo']");
const table = document.querySelector(".usersAdminTable");

toggle.addEventListener("change", async (e) => {
  currentMode = toggle.checked ? "transportistas" : "users";

  if (currentMode === "users") {
    const root = document.getElementById("app-root");

    root.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = "/api/userdata/usersadmin";
    }, 300);

    return;
  }

  const container = e.target.closest(".form-check");
  const spinner = container.querySelector(".roleSpinner");

  spinner.classList.remove("d-none");

  try {
    await fadeOutTable();

    updateTableHeaders();
    addBtn.classList.remove("d-none");

    col1.style.width = "100px";
    col2.style.width = "550px";

    await loadData();

    table.style.transition = "opacity 0.25s ease";
    table.style.opacity = "1";
  } finally {
    spinner.classList.add("d-none");
  }
});

function fadeOutTable() {
  return new Promise((resolve) => {
    table.style.transition = "opacity 0.25s ease";
    table.style.opacity = "0";

    setTimeout(resolve, 250);
  });
}

table.addEventListener("transitionend", () => {
  table.classList.remove("table-enter-active");
});

document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("saveBtn")) return;

  const row = e.target.closest("tr");
  const isNew = row.dataset.new === "true";

  const nbrInput = row.querySelector(".transportNbr");
  const nameInput = row.querySelector(".transportName");

  const transport_nbr = nbrInput?.value.trim() || "";
  const name = nameInput?.value.trim() || "";

  const spinner = row.querySelector(".roleSpinner");
  const btn = e.target;

  try {
    btn.disabled = true;
    spinner.classList.remove("d-none");

    let res, data;

    if (!transport_nbr && isNew) {
      showToast({ text: "Falta número de equipo", type: "error" });
      return;
    }

    if (isNew) {
      // 🔥 INSERT
      res = await fetch(`/api/userdata/transportistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transport_nbr, name }),
      });

      data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // normalizar fila
      row.dataset.id = data.id;
      delete row.dataset.new;
      row.classList.remove("table-success");

      showToast({
        text: "Transportista creado",
        type: "success",
      });
    } else {
      // 🔁 UPDATE
      const id = row.dataset.id;

      res = await fetch(`/api/userdata/transportistas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      data = await res.json();

      if (!res.ok) throw new Error(data.error);

      showToast({
        text: "Guardado",
        type: "success",
      });
    }
  } catch (err) {
    showToast({
      text: err.message || "Error",
      type: "error",
    });
  } finally {
    spinner.classList.add("d-none");
    btn.disabled = false;
    loadData();
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("cancelBtn")) return;

  const row = e.target.closest("tr");
  row.remove();
});

async function loadData() {
  const res = await fetch("/api/userdata/transportistas");
  const data = await res.json();

  renderTransportistas(data);
}

function renderTransportistas(data) {
  tbody.innerHTML = data
    .map(
      (t) => `
    <tr data-id="${t.id}">
      <td class="col1">
        <input class="form-control form-control-sm transportNbr"
          value="${t.transport_nbr || ""}"
          disabled
        >
      </td>

      <td class="col2">
        <input class="form-control form-control-sm transportName"
          value="${t.name || ""}">
      </td>

      <td class="text-end">
        <button class="btn btn-success btn-sm saveBtn" type="button">
          Guardar
          <span
            class="roleSpinner d-none spinner-border spinner-border-sm">
          </span></button>
        <button class="btn btn-danger btn-sm deleteBtn" type="button">Eliminar</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

addBtn.addEventListener("click", () => {
  const newRow = document.createElement("tr");

  newRow.dataset.new = "true"; // 🔥 clave para distinguir
  newRow.classList.add("table-success"); // verde Bootstrap

  newRow.innerHTML = `
    <td class="col1">
      <input class="form-control form-control-sm transportNbr">
    </td>

    <td class="col2">
      <input class="form-control form-control-sm transportName">
    </td>

    <td class="text-end">
      <button class="btn btn-success btn-sm saveBtn" type="button">
        Guardar
        <span class="roleSpinner d-none spinner-border spinner-border-sm"></span>
      </button>
      <button class="btn btn-secondary btn-sm cancelBtn" type="button" style="width: 90px">
        Cancelar
      </button>
    </td>
  `;

  tbody.prepend(newRow); // arriba de todo
});

document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("deleteBtn")) return;

  const row = e.target.closest("tr");
  const id = row.dataset.id;

  const nbr = row.querySelector(".transportNbr")?.value || "";
  const name = row.querySelector(".transportName")?.value || "";

  const confirmed = await confirmModal({
    title: "Eliminar transportista",
    body: `Se eliminará el transportista <b>${nbr} - ${name}</b><br><br>Esta acción no se puede deshacer.`,
    confirmText: "Eliminar",
    confirmClass: "btn-danger",
  });

  if (!confirmed) return;

  try {
    const res = await fetch(`/api/userdata/transportistas/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error eliminando");
    }

    row.remove();

    showToast({
      text: "Transportista eliminado",
      type: "success",
    });
  } catch (err) {
    showToast({
      text: err.message || "Error",
      type: "error",
    });
  }
});

function setFieldError(input, message) {
  input.classList.add("is-invalid");

  let feedback = input.parentNode.querySelector(".invalid-feedback");

  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    input.parentNode.appendChild(feedback);
  }

  feedback.textContent = message;
}

function clearFieldError(input) {
  input.classList.remove("is-invalid");
}

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("transportNbr")) {
    clearFieldError(e.target);
  }
});

function isDuplicateNbr(value, currentRow) {
  const rows = document.querySelectorAll("tbody tr");

  return Array.from(rows).some((row) => {
    if (row === currentRow) return false;

    const val = row.querySelector(".transportNbr")?.value?.trim();
    return val === value;
  });
}

function updateTableHeaders() {
  const thCol1 = document.getElementById("thCol1");
  const thCol2 = document.getElementById("thCol2");
  if (currentMode === "transportistas") {
    usersFormTitle.textContent = "Administración de transportistas";
    thCol1.textContent = "Equipo";
    thCol2.textContent = "Nombre y apellido";
    label.textContent = "Ir a Usuarios";
  } else {
    thCol1.textContent = "Email";
    thCol2.textContent = "Rol";
    label.textContent = "Ir a Transportistas";
  }
}

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("transportNbr")) {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }
  if (
    e.target.classList.contains("transportNbr") ||
    e.target.classList.contains("transportName")
  ) {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;

    e.target.value = e.target.value.toUpperCase();

    // 🔥 mantener cursor (importante)
    e.target.setSelectionRange(start, end);
  }
});

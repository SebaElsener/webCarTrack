const navBarMin = document.getElementById("navBarMin");
navBarMin.style.top = "0";

const savedMode = localStorage.getItem("modoAdmin");

if (savedMode === "transportistas") {
  toggle.checked = true;
  currentMode = "transportistas";
}
const search = document.getElementById("userSearch");
const tbody = document.querySelector("tbody");
const toggle = document.getElementById("toggleTipo");
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
  localStorage.setItem("modoAdmin", currentMode);

  if (currentMode === "users") {
    window.location.href = "/api/userdata/usersadmin";
    return;
  }

  updateTableHeaders();

  // 👉 transportistas
  label.textContent = "Transportistas";
  addBtn.classList.remove("d-none");

  const container = e.target.closest(".form-check");
  const spinner = container.querySelector(".roleSpinner");

  col1.style.width = "100px";
  col2.style.width = "550px";

  // 🔥 LIMPIAR TABLA ANTES (importante)
  tbody.innerHTML = "";

  spinner.classList.remove("d-none");

  try {
    await loadData();
  } finally {
    spinner.classList.add("d-none");
  }
});

document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("saveBtn")) return;

  const row = e.target.closest("tr");
  const id = row.dataset.id;

  const nameInput = row.querySelector(".transportName");
  const name = nameInput.value.trim();

  const spinner = row.querySelector(".roleSpinner");

  try {
    e.target.disabled = true;
    spinner.classList.remove("d-none");

    const res = await fetch(`/api/userdata/transportistas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    showToast({ text: "Guardado", type: "success" });
  } catch (err) {
    showToast({
      text: err.message || "Error",
      type: "error",
    });
  } finally {
    spinner.classList.add("d-none");
    e.target.disabled = false;
  }
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

addBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("/api/userdata/transportistas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transport_nbr: "",
        name: "",
      }),
    });

    const nuevo = await res.json();

    await loadData();

    showToast({
      text: "Transportista creado",
      type: "success",
    });
  } catch {
    showToast({
      text: "Error creando",
      type: "error",
    });
  }
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
  if (currentMode === "transportistas") {
    thCol1.textContent = "Equipo";
    thCol2.textContent = "Nombre y apellido";
  } else {
    thCol1.textContent = "Email";
    thCol2.textContent = "Rol";
  }
}

import areas from "../utils/areas.json" with { type: "json" };
import averias from "../utils/averias.json" with { type: "json" };
import gravedades from "../utils/gravedades.json" with { type: "json" };
import { inlineEditor } from "./inline-edit/inline-edit.init.js";

const indexById = (arr) =>
  Object.fromEntries(arr.map((i) => [i.id, i.descripcion]));

const areasMap = indexById(areas);
const averiasMap = indexById(averias);
const gravedadesMap = indexById(gravedades);

const FILAS_POR_PAGINA = 10;
let datosGlobales = [];
let paginaActual = 1;
let accionesPostTablaMostradas = false;
let vin = "";
let fotosPorScan = {};

// Eliminar daños
window.deleteMode = false;
let addDamageMode = false;

const navBarMin = document.getElementById("navBarMin");
navBarMin.style.top = "0";
const dropdownContent = document.getElementById("dropdownContent");
dropdownContent.style.marginTop = "0";

// Submit del formulario
document.getElementById("form-vin").addEventListener("submit", async (e) => {
  e.preventDefault();
  accionesPostTablaMostradas = false;
  const acciones = document.querySelectorAll(".post-table-action-buttons");

  // Reset visual
  acciones.forEach((el) => {
    el.style.display = "none";
  });

  vin = document.getElementById("vinInput").value.trim();
  if (!vin) return toastError("Ingrese un VIN válido");

  await cargarDatos(vin);
});

// Mostrar spinner
function mostrarSpinner() {
  document.getElementById("resultadosVIN").innerHTML = `
    <div class="d-flex justify-content-center align-items-center my-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;
}

// Cargar datos desde el backend
async function cargarDatos(vin) {
  mostrarSpinner();
  try {
    const res = await fetch("/api/querys/queryByVIN", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin }),
    });

    const data = await res.json();
    if (!data || data.length === 0) {
      document.getElementById("resultadosVIN").innerHTML =
        "<p class='text-muted'>No se encontraron datos</p>";
      return;
    }

    fotosPorScan = {};

    data.forEach((scan) => {
      if (!scan.fotos?.length) return;

      fotosPorScan[scan.scan_id] = scan.fotos.map((f, idx) => ({
        pict_id: f.id,
        pict_scan_id: f.pict_scan_id,
        href: f.pictureurl,
        type: "image",
        title: `VIN ${scan.vin} · Scan ${f.pict_scan_id} · Imagen ${idx + 1}`,
      }));
    });

    const transformScans = data.map((scan) => ({
      ...scan,
      damages: scan.damages.map((d) => ({
        ...d,
        area_desc: areasMap[d.area] ?? null,
        averia_desc: averiasMap[d.averia] ?? null,
        grav_desc: gravedadesMap[d.grav] ?? null,
      })),
    }));

    datosGlobales = transformScans;

    paginaActual = 1;
    renderTabla();
  } catch (err) {
    console.error(err);
    document.getElementById("resultadosVIN").innerHTML =
      "<p class='text-danger'>Error al obtener los datos</p>";
  }
}

function mostrarAccionesPostTabla() {
  if (accionesPostTablaMostradas) return;

  const acciones = document.querySelectorAll(".post-table-action-buttons");
  const delayBase = 200;
  const delayStep = 180;

  // Reset visual
  acciones.forEach((el) => {
    el.style.display = "block";
  });

  acciones.forEach((el) => {
    el.classList.remove("animate-in");
    el.style.opacity = "0";
  });

  acciones.forEach((el, i) => {
    setTimeout(
      () => {
        el.classList.add("animate-in");
      },
      delayBase + i * delayStep,
    );
  });

  accionesPostTablaMostradas = true;
}

// Render de tabla
function renderTabla() {
  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
  const fin = inicio + FILAS_POR_PAGINA;
  const paginaDatos = datosGlobales.slice(inicio, fin);

  let rows = "";

  paginaDatos.forEach((scan) => {
    if (!scan.damages || scan.damages.length === 0) {
      rows += `
      <tr class="resultadosVINtr scan-base-row" data-scan-id="${scan.scan_id}">
        <td>${new Date(scan.scan_date).toLocaleString("es-AR")}</td>
        <td>${scan.marca ?? ""}</td>
        <td>${scan.modelo ?? ""}</td>
        <td class="vin-cell">
          ${
            addDamageMode
              ? `
                <span
                  class="add-damage-icon"
                  data-scanid="${scan.scan_id}"
                  title="Agregar daño"
                >
                  <i class="mdi mdi-plus-circle-outline"></i>
                </span>
              `
              : ""
          }

          ${
            fotosPorScan[scan.scan_id]?.length
              ? `
                <a
                  href="#"
                  class="vin-link open-gallery"
                  data-scanid="${scan.scan_id}"
                  title="Ver fotos"
                >
                  <span>${scan.vin}</span>
                </a>
              `
              : `
                <span class="vin-text">${scan.vin ?? ""}</span>
              `
          }
        </td>
        <!-- ÁREA -->
        <td
          class="editable-cell text-center"
          data-field="area"
          data-scan-id="${scan.scan_id}"
          data-damage-id=""
        >
          <span class="cell-value text-muted-table">—</span>
        </td>

        <!-- AVERÍA -->
        <td
          class="editable-cell text-center"
          data-field="averia"
          data-scan-id="${scan.scan_id}"
          data-damage-id=""
        >
          <span class="cell-value text-muted-table">—</span>
        </td>

        <!-- GRAVEDAD -->
        <td
          class="editable-cell text-center"
          data-field="gravedad"
          data-scan-id="${scan.scan_id}"
          data-damage-id=""
        >
          <span class="cell-value text-muted-table">—</span>
        </td>

        <!-- OBSERVACIÓN -->
        <td
          class="editable-cell text-center"
          data-field="observacion"
          data-scan-id="${scan.scan_id}"
          data-damage-id=""
        >
          <span class="cell-value text-muted-table">Sin daños</span>
        </td>
        <td>${scan.batea ?? ""}</td>
        <td>${scan.movimiento ?? ""}</td>
        <td>${renderClimaIcon(scan.clima)}</td>
        <td>${scan.user ?? ""}</td>
      </tr>
    `;
    } else {
      scan.damages.forEach((damage) => {
        rows += `
          <tr class="resultadosVINtr scan-base-row"
              data-scan-id="${scan.scan_id}"
              data-damage-id="${damage.id ?? ""}"
          >
            <td>${new Date(scan.scan_date).toLocaleString("es-AR")}</td>
            <td>${scan.marca ?? ""}</td>
            <td>${scan.modelo ?? ""}</td>
            <td class="vin-cell">
              ${
                addDamageMode
                  ? `
                    <span
                      class="add-damage-icon"
                      data-scanid="${scan.scan_id}"
                      title="Agregar daño"
                    >
                      <i class="mdi mdi-plus-circle-outline"></i>
                    </span>
                  `
                  : ""
              }

              ${
                fotosPorScan[scan.scan_id]?.length
                  ? `
                    <a
                      href="#"
                      class="vin-link open-gallery"
                      data-scanid="${scan.scan_id}"
                      title="Ver fotos"
                    >
                      <span>${scan.vin}</span>
                    </a>
                  `
                  : `
                    <span class="vin-text">${scan.vin ?? ""}</span>
                  `
              }
            </td>
            <td
              class="editable-cell area-cell"
              data-field="area"
              data-scan-id="${scan.scan_id}"
              data-damage-id="${damage.id ?? ""}"
            >
              <span
                class="damage-delete-icon d-none"
                title="Eliminar daño"
                data-damage-id="${damage.id ?? ""}"
              >
                <i class="mdi mdi-trash-can-outline"></i>
              </span>

              <span class="cell-value">
                ${damage.area + " - " + damage.area_desc}
              </span>
            </td>
            <td
              class="editable-cell"
              data-field="averia"
              data-scan-id="${scan.scan_id}"
              data-damage-id="${damage.id ?? ""}"
            >
              <span class="cell-value">${damage.averia + " - " + damage.averia_desc}</span>
            </td>
            <td
              class="editable-cell"
              data-field="gravedad"
              data-scan-id="${scan.scan_id}"
              data-damage-id="${damage.id ?? ""}"
            >
              <span class="cell-value">${damage.grav_desc}</span>
            </td>
            <td
              class="editable-cell"
              data-field="observacion"
              data-scan-id="${scan.scan_id}"
              data-damage-id="${damage.id ?? ""}"
            >
              <span class="cell-value">${damage.obs}</span>            
            </td>
            <td>${scan.batea ?? ""}</td>
            <td>${scan.movimiento ?? ""}</td>
            <td>${renderClimaIcon(scan.clima)}</td>
            <td>${scan.user ?? ""}</td>
          </tr>
        `;
      });
    }
  });

  document.getElementById("resultadosVIN").innerHTML = `
    <div class="table-responsive">
      <table
        id="tabla-resultadosVIN"
        class="table table-striped table-hover table-bordered table-auto"
      >
        <thead>
          <tr>
            <th class="dateTh">Fecha</th>
            <th class="marcaTh">Marca</th>
            <th class="modeloTh">Modelo</th>
            <th class="VINth">VIN</th>
            <th class="areaTh">Area</th>
            <th class="averiaTh">Avería</th>
            <th class="gravTh">Gravedad</th>
            <th class="obsTh">Observación</th>
            <th class="bateaTh">Batea</th>
            <th class="movimientoTh">Movimiento</th>
            <th class="climaTh">Clima</th>
            <th class="userTh">Usuario</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  const table = document.getElementById("tabla-resultadosVIN");

  /* anchos iniciales por columna */
  const initialWidths = {
    dateTh: 140,
    marcaTh: 100,
    modeloTh: 120,
    VINth: 210,
    areaTh: 240,
    averiaTh: 170,
    gravTh: 120,
    obsTh: 200,
    userTh: 80,
    bateaTh: 60,
    movimientoTh: 60,
    climaTh: 60,
  };

  Object.entries(initialWidths).forEach(([cls, width]) => {
    const th = table.querySelector(`th.${cls}`);
    if (th) th.style.width = `${width}px`;
  });

  // esperar un frame
  requestAnimationFrame(() => {
    mostrarAccionesPostTabla();
  });

  // 🔥 reset delete mode después de re-render
  window.deleteMode = false;
  document.querySelectorAll(".damage-delete-icon").forEach((icon) => {
    icon.classList.add("d-none");
  });

  // 🔹 Activar resize manual
  enableColumnResize("tabla-resultadosVIN");
}

function renderClimaIcon(clima) {
  if (!clima) return "";

  const c = clima.toLowerCase();

  switch (c) {
    case "sol":
      return `<i class="mdi mdi-weather-sunny text-warning" title="Sol"></i>`;

    case "noche":
      return `<i class="mdi mdi-weather-night text-dark" title="Noche"></i>`;

    case "lluvia":
      return `<i class="mdi mdi-weather-rainy text-primary" title="Lluvia"></i>`;

    case "hielo":
      return `<i class="mdi mdi-snowflake text-info" title="Hielo"></i>`;

    case "rocío":
      return `<i class="mdi mdi-water-outline text-secondary" title="Rocío"></i>`;

    default:
      return `<i class="mdi mdi-help-circle-outline text-muted" title="${clima}"></i>`;
  }
}

// Resizer tabla
function enableColumnResize(tableId) {
  const table = document.getElementById(tableId);
  const headers = table.querySelectorAll("th");

  headers.forEach((th) => {
    if (th.querySelector(".th-resize")) return;

    const resizer = document.createElement("div");
    resizer.classList.add("th-resize");
    th.appendChild(resizer);

    let startX, startWidth;

    resizer.addEventListener("mousedown", (e) => {
      startX = e.pageX;
      startWidth = th.offsetWidth;

      function mouseMove(e) {
        const newWidth = Math.max(60, startWidth + (e.pageX - startX));
        th.style.width = newWidth + "px";
      }

      function mouseUp() {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", mouseUp);
      }

      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", mouseUp);

      e.preventDefault();
    });
  });
}

/// Listeners action buttons
document.getElementById("btnUpdateDamages").addEventListener("click", () => {
  inlineEditor.saveAll();
});

// Listener celdas tabla para modificar daños
document.addEventListener("click", (e) => {
  const cell = e.target.closest(".editable-cell");
  if (!cell || cell.classList.contains("editing")) return;
});

// cerrar dropdown al scrollear
// document.addEventListener(
//   "scroll",
//   () => {
//     document
//       .querySelectorAll(".dropdown-toggle.show")
//       .forEach((btn) => bootstrap.Dropdown.getInstance(btn)?.hide());
//   },
//   true,
// );

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".open-gallery");
  if (!btn) return;

  const scanId = btn.dataset.scanid;
  if (!scanId || !fotosPorScan[scanId]) return;

  const lightbox = GLightbox({
    elements: fotosPorScan[scanId],
    loop: true,
    zoomable: true,
    draggable: true,
    preload: true,
  });

  lightbox.on("open", () => {
    injectGalleryControls(lightbox, scanId);
  });

  lightbox.open();
});

function injectGalleryControls(lightbox, scanId) {
  const interval = setInterval(() => {
    const container = document.querySelector(".glightbox-container");
    if (!container) return;

    clearInterval(interval);
    if (container.querySelector(".gallery-controls")) return;

    const controls = document.createElement("div");
    controls.className = "gallery-controls";
    controls.innerHTML = `
      <button class="btn btn-sm btn-danger" data-action="delete-one">
        <i class="mdi mdi-trash-can-outline"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger" data-action="delete-all">
        <i class="mdi mdi-delete-sweep-outline"></i>
      </button>
    `;

    container.appendChild(controls);

    controls.addEventListener("click", async (e) => {
      e.stopPropagation();

      const action = e.target.closest("button")?.dataset.action;
      if (!action) return;

      if (action === "delete-one") {
        await deleteCurrentPhoto(lightbox, scanId);
      }

      if (action === "delete-all") {
        await deleteAllPhotos(lightbox, scanId);
      }
    });

    lightbox.on("close", () => controls.remove());
  }, 50);
}

async function deleteCurrentPhoto(lightbox, scanId) {
  const oldIndex = lightbox.index;
  const photo = fotosPorScan[scanId]?.[oldIndex];
  if (!photo) return;

  const confirmed = await confirmModal({
    title: "Eliminar foto",
    body: "¿Eliminar esta foto?",
    confirmText: "Eliminar",
    confirmClass: "btn-danger",
  });
  if (!confirmed) return;

  try {
    showGallerySpinner();
    await fetch("/api/photos/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pict_id: photo.pict_id,
        pictureurl: photo.href,
      }),
    });

    // 🔥 actualizar estado
    fotosPorScan[scanId].splice(oldIndex, 1);

    // si no quedan fotos
    if (!fotosPorScan[scanId].length) {
      lightbox.close();
      hardResetGLightbox();
      delete fotosPorScan[scanId];
      renderTabla();
      toastSuccess("Foto eliminada");

      return;
    }

    // 🔥 índice nuevo (misma posición visual)
    const newIndex = Math.min(oldIndex, fotosPorScan[scanId].length - 1);

    // 🔥 cierre silencioso
    lightbox.close();

    // 🔥 limpieza total
    hardResetGLightbox();

    // 🔥 reapertura inmediata y controlada
    requestAnimationFrame(() => {
      const fresh = GLightbox({
        elements: fotosPorScan[scanId],
        startAt: newIndex,
        loop: true,
        preload: false,
        zoomable: true,
        draggable: true,
      });

      fresh.on("open", () => {
        injectGalleryControls(fresh, scanId);
      });

      fresh.open();
    });

    toastSuccess("Foto eliminada");
  } catch (err) {
    console.error(err);
    toastError("No se pudo eliminar la foto");
  } finally {
    hideGallerySpinner();
  }
}

async function deleteAllPhotos(lightbox, scanId) {
  const confirmed = await confirmModal({
    title: "Eliminar galería",
    body: `
      <p class="mb-0">
        ¿Eliminar <strong>TODAS</strong> las fotos?<br>
        <small class="text-muted">Esta acción no se puede deshacer</small>
      </p>
    `,
    confirmText: "Eliminar todo",
    confirmClass: "btn-danger",
  });

  if (!confirmed) return;

  try {
    showGallerySpinner();
    await fetch("/api/photos/delete-all", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scan_id: scanId }),
    });

    // 🔥 cerrar lightbox actual
    try {
      lightbox.close();
    } catch {}

    // 🔥 limpieza total (loader, container, estado)
    hardResetGLightbox();

    // 🔥 limpiar estado frontend
    delete fotosPorScan[scanId];

    // 🔥 refrescar tabla (VIN deja de ser link)
    renderTabla();

    toastSuccess("Galería eliminada");
  } catch (err) {
    console.error(err);
    toastError("No se pudo eliminar la galería");
  } finally {
    hideGallerySpinner();
  }
}

function hardResetGLightbox() {
  document
    .querySelectorAll(".glightbox-container, .glightbox-clean, .gloader")
    .forEach((el) => el.remove());

  document.body.classList.remove("glightbox-open");
}

document.getElementById("btnDeleteDamages").addEventListener("click", () => {
  deleteMode = !deleteMode;

  document.querySelectorAll(".damage-delete-icon").forEach((icon) => {
    icon.classList.toggle("d-none", !deleteMode);
  });
});

document.addEventListener("click", async (e) => {
  const icon = e.target.closest(".damage-delete-icon");
  if (!icon) return;

  e.stopPropagation(); // 🔥 evita inline-edit

  const damageId = icon.dataset.damageId;
  if (!damageId) return;

  const confirmed = await confirmModal({
    title: "Eliminar daño",
    body: `
      <p class="mb-0">
        ¿Eliminar este daño?<br>
        <small class="text-muted">Esta acción no se puede deshacer</small>
      </p>
    `,
    confirmText: "Eliminar",
    confirmClass: "btn-danger",
  });

  if (!confirmed) return;

  try {
    const res = await fetch(`/api/damages/deletedamages/${damageId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error backend");

    // 🔥 eliminar del estado
    datosGlobales = datosGlobales.map((scan) => ({
      ...scan,
      damages: scan.damages?.filter((d) => d.id !== damageId),
    }));

    // 🔥 eliminar fila visualmente
    const row = document.querySelector(`tr[data-damage-id="${damageId}"]`);

    if (row) {
      const tbody = row.parentNode;

      row.style.opacity = "0";

      setTimeout(() => {
        row.remove();

        // 🔍 ¿quedan daños?
        const quedanDanios =
          tbody.querySelectorAll("tr[data-damage-id]").length > 0;

        if (!quedanDanios) {
          renderTabla();
        }
      }, 200);
    }

    toastSuccess("Daño eliminado");
  } catch (err) {
    console.error(err);
    toastError("No se pudo eliminar el daño");
  }
});

if (!document.querySelector(".damage-delete-icon")) {
  deleteMode = false;
}

document.getElementById("btnAddDamage").addEventListener("click", () => {
  addDamageMode = !addDamageMode;

  // feedback visual
  document
    .getElementById("btnAddDamage")
    .classList.toggle("active", addDamageMode);

  // si estaba deleteMode, lo apagamos
  if (window.deleteMode) {
    window.deleteMode = false;
    document.querySelectorAll(".damage-delete-icon").forEach((icon) => {
      icon.classList.add("d-none");
    });
  }

  renderTabla();
});

document.addEventListener("click", (e) => {
  const icon = e.target.closest(".add-damage-icon");
  if (!icon) return;

  e.stopPropagation();
  e.preventDefault();

  const scanId = icon.dataset.scanid;
  console.log("CLICK ➕ scanId:", scanId); // 🧪 DEBUG

  if (!scanId) return;

  agregarDanio(scanId);
});

function agregarDanio(scanId) {
  const scan = datosGlobales.find((s) => String(s.scan_id) === String(scanId));

  // 🚫 evitar más de uno nuevo
  const existing = document.querySelector(
    `.resultadosVINtr.new-damage-row[data-scan-id="${scanId}"]`,
  );
  if (existing) {
    toastInfo("Guardá el daño actual antes de agregar otro");
    return;
  }

  // 🔎 fila del VIN
  const vinRow = document.querySelector(
    `.scan-base-row[data-scan-id="${scanId}"]`,
  );

  if (!vinRow) return;

  // 🔥 crear fila
  const temp = document.createElement("tbody");
  temp.innerHTML = createNewDamageRow(scan);
  const newRow = temp.firstElementChild;

  // 🔥 animación inicial
  newRow.style.opacity = "0";
  newRow.style.transform = "translateY(-6px)";

  vinRow.after(newRow);

  // 🎬 animar entrada
  requestAnimationFrame(() => {
    newRow.style.transition = "all 200ms ease";
    newRow.style.opacity = "1";
    newRow.style.transform = "translateY(0)";
  });

  // ✏️ abrir editor automáticamente (Área)
  requestAnimationFrame(() => {
    const cell = newRow.querySelector(`.editable-cell[data-field="area"]`);
    if (cell) cell.click();
  });
}

function createNewDamageRow(scan) {
  return `
    <tr class="resultadosVINtr new-damage-row" data-damage-id="">
      <td>${new Date(scan.scan_date).toLocaleString("es-AR")}</td>
      <td>${scan.marca ?? ""}</td>
      <td>${scan.modelo ?? ""}</td>
      <td>
        ${
          fotosPorScan[scan.scan_id]?.length
            ? `
              <a href="#" class="vin-link open-gallery" data-scanid="${scan.scan_id}">
                <span>${scan.vin}</span>
              </a>
            `
            : `<span class="vin-text">${scan.vin}</span>`
        }
      </td>

      <td class="editable-cell area-cell"
          data-field="area"
          data-scan-id="${scan.scan_id}"
          data-damage-id="">
        <span class="cell-value text-muted">—</span>
      </td>

      <td class="editable-cell"
          data-field="averia"
          data-scan-id="${scan.scan_id}"
          data-damage-id="">
        <span class="cell-value text-muted">—</span>
      </td>

      <td class="editable-cell"
          data-field="gravedad"
          data-scan-id="${scan.scan_id}"
          data-damage-id="">
        <span class="cell-value text-muted">—</span>
      </td>

      <td class="editable-cell"
          data-field="observacion"
          data-scan-id="${scan.scan_id}"
          data-damage-id="">
        <span class="cell-value text-muted"></span>
      </td>

      <td>${scan.batea ?? ""}</td>
      <td>${scan.movimiento ?? ""}</td>
      <td>${renderClimaIcon(scan.clima)}</td>
      <td>${scan.user ?? ""}</td>
    </tr>
  `;
}

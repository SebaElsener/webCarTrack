import areas from "../utils/areas.json" with { type: "json" };
import averias from "../utils/averias.json" with { type: "json" };
import gravedades from "../utils/gravedades.json" with { type: "json" };

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
let areaInputEnabled = false;

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
  if (!vin) return alert("Ingrese un VIN válido");

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
      <tr>
        <td>${new Date(scan.scan_date).toLocaleString("es-AR")}</td>
        <td>${scan.marca ?? ""}</td>
        <td>${scan.modelo ?? ""}</td>
        <td>${scan.vin ?? ""}</td>

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

        <td>${renderClimaIcon(scan.clima)}</td>
        <td>${scan.user ?? ""}</td>

        <td class="text-center">
          ${
            scan.fotos?.length
              ? scan.fotos
                  .map(
                    (f, idx) => `
                      <a
                        href="${f}"
                        class="glightbox"
                        data-gallery="gallery-${scan.scan_id}"
                        data-title="Imagen ${idx + 1} de ${scan.fotos.length}"
                        ${idx > 0 ? 'style="display:none"' : ""}
                      >
                        ${
                          idx === 0
                            ? `<i class="bi bi-camera-fill" style="font-size:1.2rem;color:#007bff;"></i>`
                            : ""
                        }
                      </a>
                    `,
                  )
                  .join("")
              : ""
          }
        </td>
      </tr>
    `;
    } else {
      scan.damages.forEach((damage) => {
        rows += `
          <tr>
            <td>${new Date(scan.scan_date).toLocaleString("es-AR")}</td>
            <td>${scan.marca ?? ""}</td>
            <td>${scan.modelo ?? ""}</td>
            <td>${scan.vin ?? ""}</td>
  
            <td
              class="editable-cell"
              data-field="area"
              data-damage-id="${damage.id}"
            >
              <span class="cell-value">${damage.area + " - " + damage.area_desc}</span>
            </td>
            <td
              class="editable-cell"
              data-field="averia"
              data-damage-id="${damage.id}"
            >
              <span class="cell-value">${damage.averia + " - " + damage.averia_desc}</span>
            </td>
            <td
              class="editable-cell"
              data-field="gravedad"
              data-damage-id="${damage.id}"
            >
              <span class="cell-value">${damage.grav_desc}</span>
            </td>
            <td
              class="editable-cell"
              data-field="observacion"
              data-damage-id="${damage.id}"
            >
              <span class="cell-value">${damage.obs}</span>            
            </td>
            <td>${renderClimaIcon(scan.clima)}</td>
            <td>${scan.user ?? ""}</td>
            <td class="text-center">
              ${
                scan.fotos?.length
                  ? scan.fotos
                      .map(
                        (f, idx) => `
                          <a
                            href="${f}"
                            class="glightbox"
                            data-gallery="gallery-${scan.scan_id}"
                            data-title="Imagen ${idx + 1} de ${
                              scan.fotos.length
                            }"
                            ${idx > 0 ? 'style="display:none"' : ""}
                          >
                            ${
                              idx === 0
                                ? `<i class="bi bi-camera-fill" style="font-size:1.2rem;color:#007bff;"></i>`
                                : ""
                            }
                          </a>
                        `,
                      )
                      .join("")
                  : ""
              }
            </td>
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
            <th id="marcaTh">Marca</th>
            <th id="modeloTh">Modelo</th>
            <th class="VINth">VIN</th>
            <th class="areaTh">Area</th>
            <th class="averiaTh">Avería</th>
            <th class="gravTh">Gravedad</th>
            <th>Observación</th>
            <th class="climaTh">Clima</th>
            <th>Usuario</th>
            <th class="fotosTh">Fotos</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  // esperar un frame
  requestAnimationFrame(() => {
    mostrarAccionesPostTabla();
  });

  // 🔹 Ajuste automático inicial de ancho según contenido
  const table = document.getElementById("tabla-resultadosVIN");
  table.querySelectorAll("th").forEach((th) => {
    th.style.width = th.scrollWidth + 20 + "px";
  });

  // 🔹 Activar resize manual
  enableColumnResize("tabla-resultadosVIN");

  // 🔹 Inicializar GLightbox
  GLightbox({
    selector: ".glightbox",
    loop: true,
    zoomable: true,
    touchNavigation: true,
    keyboardNavigation: true,
    returnFocus: false,
  });
}

function renderClimaIcon(clima) {
  if (!clima) return "";

  const c = clima.toLowerCase();

  switch (c) {
    case "sunny":
      return `<i class="mdi mdi-weather-sunny text-warning" title="Sunny"></i>`;

    case "night":
      return `<i class="mdi mdi-weather-night text-dark" title="Night"></i>`;

    case "rain":
      return `<i class="mdi mdi-weather-rainy text-primary" title="Rain"></i>`;

    case "frost":
      return `<i class="mdi mdi-snowflake text-info" title="Frost"></i>`;

    case "dew":
      return `<i class="mdi mdi-water-outline text-secondary" title="Dew"></i>`;

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
// document
//   .getElementById("btnUpdateDamages")
//   .addEventListener("click", async (e) => {
//     e.preventDefault();
//     areaInputEnabled = true;
//     renderTabla();
//   });

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

const FILAS_POR_PAGINA = 10;
let datosGlobales = [];
let paginaActual = 1;
let lightboxInstance = null;
let accionesPostTablaMostradas = false;

// Submit del formulario
document.getElementById("form-vin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const vin = document.getElementById("vinInput").value.trim();
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
      // document.getElementById("paginacion").innerHTML = "";
      return;
    }

    // Guardar los scans completos
    datosGlobales = data.map((s) => ({
      scan_id: s.scan_id,
      vin: s.vin,
      marca: s.marca,
      modelo: s.modelo,
      clima: s.clima,
      user: s.user,
      scan_date: s.scan_date,
      damages: s.damages ?? [],
      fotos: s.fotos ?? [], // ya vienen como URLs
    }));

    paginaActual = 1;
    renderTabla();
    // renderPaginacion();
  } catch (err) {
    console.error(err);
    document.getElementById("resultadosVIN").innerHTML =
      "<p class='text-danger'>Error al obtener los datos</p>";
    // document.getElementById("paginacion").innerHTML = "";
  }
}

function mostrarAccionesPostTabla() {
  if (accionesPostTablaMostradas) return;

  const acciones = document.querySelectorAll(".post-table-action");
  const delayBase = 500; // ⏱️ delay inicial
  const delayStep = 600; // escalonado entre acciones

  acciones.forEach((el) => el.classList.remove("show"));

  acciones.forEach((el, i) => {
    setTimeout(
      () => {
        el.classList.add("show");
      },
      delayBase + i * delayStep,
    );
  });

  accionesPostTablaMostradas = true;
}

// Render de tabla
function renderTabla() {
  mostrarAccionesPostTabla();

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
          <td colspan="4" class="text-center">Sin daños</td>
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
            <td>${damage.area_desc ?? ""}</td>
            <td>${damage.averia_desc ?? ""}</td>
            <td>${damage.grav_desc ?? ""}</td>
            <td class="wrap">${damage.obs ?? ""}</td>
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

// // Render de paginación
// function renderPaginacion() {
//   const totalPaginas = Math.ceil(datosGlobales.length / FILAS_POR_PAGINA);
//   let html = `<nav><ul class="pagination justify-content-center">`;

//   html += `
//     <li class="page-item ${paginaActual === 1 ? "disabled" : ""}">
//       <button class="page-link" onclick="cambiarPagina(${
//         paginaActual - 1
//       })">Anterior</button>
//     </li>
//   `;

//   for (let i = 1; i <= totalPaginas; i++) {
//     html += `
//       <li class="page-item ${paginaActual === i ? "active" : ""}">
//         <button class="page-link" onclick="cambiarPagina(${i})">${i}</button>
//       </li>
//     `;
//   }

//   html += `
//     <li class="page-item ${paginaActual === totalPaginas ? "disabled" : ""}">
//       <button class="page-link" onclick="cambiarPagina(${
//         paginaActual + 1
//       })">Siguiente</button>
//     </li>
//   `;

//   html += `</ul></nav>`;
//   document.getElementById("paginacion").innerHTML = html;
// }

// // Cambiar página
// function cambiarPagina(nuevaPagina) {
//   const totalPaginas = Math.ceil(datosGlobales.length / FILAS_POR_PAGINA);
//   if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
//   paginaActual = nuevaPagina;
//   mostrarSpinner();
//   setTimeout(() => {
//     renderTabla();
//     renderPaginacion();
//   }, 100);
// }

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

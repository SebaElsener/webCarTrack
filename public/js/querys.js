document.getElementById("form-fechas").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fechas = document.getElementById("rangoFechas").value.split(" to ");
  if (fechas.length !== 2) {
    alert("Seleccioná un rango válido");
    return;
  }

  const [desde, hasta] = fechas;

  cargarDatos(desde, hasta);
});

const FILAS_POR_PAGINA = 20;
let paginaActual = 1;
let datosGlobales = [];

// Función para mostrar spinner
function mostrarSpinner() {
  document.getElementById("resultados").innerHTML = `
        <div class="d-flex justify-content-center align-items-center my-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `;
}

// Función para cargar datos desde el servidor
async function cargarDatos(desde, hasta) {
  mostrarSpinner();

  await fetch("/api/querys/queryByDate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ desde, hasta }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) {
        document.getElementById("resultados").innerHTML =
          "<p class='text-muted'>No se encontraron datos</p>";
        document.getElementById("paginacion").innerHTML = "";
        return;
      }

      datosGlobales = data;
      paginaActual = 1;
      renderTabla();
      renderPaginacion();
      enableColumnResize("tabla-resultados");
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("resultados").innerHTML =
        "<p class='text-danger'>Error al obtener los datos</p>";
      document.getElementById("paginacion").innerHTML = "";
    });
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
                      `
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
            <td>${damage.area ?? ""}</td>
            <td>${damage.averia ?? ""}</td>
            <td>${damage.grav ?? ""}</td>
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
                        `
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

  document.getElementById("resultados").innerHTML = `
    <div class="table-responsive">
      <table
        id="tabla-resultados"
        class="table table-striped table-hover table-bordered table-auto"
      >
        <thead>
          <tr>
            <th class="dateTh">Fecha</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th class="VINth">VIN</th>
            <th>Área</th>
            <th>Avería</th>
            <th>Gravedad</th>
            <th>Observación</th>
            <th>Clima</th>
            <th>Usuario</th>
            <th>Fotos</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  // 🔹 Ajuste automático inicial de ancho según contenido
  const table = document.getElementById("tabla-resultados");
  table.querySelectorAll("th").forEach((th) => {
    th.style.width = th.scrollWidth + 20 + "px";
  });

  // 🔹 Activar resize manual
  enableColumnResize("tabla-resultados");

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

// Render de paginación
function renderPaginacion() {
  const totalPaginas = Math.ceil(datosGlobales.length / FILAS_POR_PAGINA);
  let html = `<nav><ul class="pagination justify-content-center">`;

  html += `
        <li class="page-item ${paginaActual === 1 ? "disabled" : ""}">
            <button class="page-link" onclick="cambiarPagina(${
              paginaActual - 1
            })">Anterior</button>
        </li>
    `;

  for (let i = 1; i <= totalPaginas; i++) {
    html += `
            <li class="page-item ${paginaActual === i ? "active" : ""}">
                <button class="page-link" onclick="cambiarPagina(${i})">${i}</button>
            </li>
        `;
  }

  html += `
        <li class="page-item ${
          paginaActual === totalPaginas ? "disabled" : ""
        }">
            <button class="page-link" onclick="cambiarPagina(${
              paginaActual + 1
            })">Siguiente</button>
        </li>
    `;

  html += `</ul></nav>`;

  document.getElementById("paginacion").innerHTML = html;
}

// Cambiar de página con spinner
function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(datosGlobales.length / FILAS_POR_PAGINA);
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

  paginaActual = nuevaPagina;

  // Mostrar spinner temporal mientras se "renderiza"
  mostrarSpinner();

  // Simular un pequeño retardo para que se vea el spinner (opcional)
  setTimeout(() => {
    renderTabla();
    renderPaginacion();
    enableColumnResize("tabla-resultados");
  }, 100); // 100ms
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

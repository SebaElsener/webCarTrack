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

const FILAS_POR_PAGINA = 10;
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
      console.log("Datos", data);
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
    // Si no hay daños, mostramos solo una fila "Sin daños"
    if (!scan.damages || scan.damages.length === 0) {
      rows += `
        <tr>
            <td>${scan.scan_id ?? ""}</td>
            <td>${scan.vin ?? ""}</td>
            <td colspan="5" class="text-center">Sin daños</td>
            <td>
              ${
                scan.fotos
                  ?.map(
                    (f, idx) => `
                <a href="${f}" class="glightbox" data-gallery="gallery-${
                      scan.scan_id
                    }" data-title="Imagen ${idx + 1} de ${scan.fotos.length}" ${
                      idx > 0 ? 'style="display:none;"' : ""
                    }>
                  <img src="${f}" class="img-thumbnail" style="width:60px;height:60px;object-fit:cover;margin-right:4px;" />
                </a>
              `
                  )
                  .join("") ?? ""
              }
            </td>
        </tr>
      `;
    } else {
      // Si hay daños, 1 fila por daño
      scan.damages.forEach((damage, dIdx) => {
        rows += `
          <tr>
              <td>${scan.scan_id ?? ""}</td>
              <td>${scan.vin ?? ""}</td>
              <td>${damage.area ?? ""}</td>
              <td>${damage.averia ?? ""}</td>
              <td>${damage.grav ?? ""}</td>
              <td>${damage.obs ?? ""}</td>
              <td>${damage.codigo ?? ""}</td>
              <td>
                ${
                  scan.fotos
                    ?.map(
                      (f, fIdx) => `
                  <a href="${f}" class="glightbox" data-gallery="gallery-${
                        scan.scan_id
                      }" data-title="Imagen ${fIdx + 1} de ${
                        scan.fotos.length
                      }" ${fIdx > 0 ? 'style="display:none;"' : ""}>
                    <img src="${f}" class="img-thumbnail" style="width:60px;height:60px;object-fit:cover;margin-right:4px;" />
                  </a>
                `
                    )
                    .join("") ?? ""
                }
              </td>
          </tr>
        `;
      });
    }
  });

  document.getElementById("resultados").innerHTML = `
    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>Modelo</th>
                <th>VIN</th>
                <th>Area</th>
                <th>Avería</th>
                <th>Gravedad</th>
                <th>Observación</th>
                <th>Código</th>
                <th>Fotos</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
  `;

  // Inicializamos GLightbox en los nuevos elementos
  const lightbox = GLightbox({
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
  }, 100); // 100ms
}

const FILAS_POR_PAGINA = 10;
let datosGlobales = [];
let paginaActual = 1;
let lightboxInstance = null;

// Submit del formulario
document.getElementById("form-vin").addEventListener("submit", async (e) => {
  e.preventDefault();
  const vin = document.getElementById("vinInput").value.trim();
  if (!vin) return alert("Ingrese un VIN válido");
  await cargarDatos(vin);
});

// Mostrar spinner
function mostrarSpinner() {
  document.getElementById("resultados").innerHTML = `
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
    console.log("DATA:", data);

    if (!data || data.length === 0) {
      document.getElementById("resultados").innerHTML =
        "<p class='text-muted'>No se encontraron datos</p>";
      document.getElementById("paginacion").innerHTML = "";
      return;
    }

    // Guardar los scans completos
    datosGlobales = data.map((s) => ({
      scan_id: s.scan_id,
      vin: s.vin,
      scan_date: s.scan_date,
      damages: s.damages ?? [],
      fotos: s.fotos ?? [], // ya vienen como URLs
    }));

    paginaActual = 1;
    renderTabla();
    renderPaginacion();
  } catch (err) {
    console.error(err);
    document.getElementById("resultados").innerHTML =
      "<p class='text-danger'>Error al obtener los datos</p>";
    document.getElementById("paginacion").innerHTML = "";
  }
}

// Renderizar tabla con daños y fotos
function renderTabla() {
  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
  const fin = inicio + FILAS_POR_PAGINA;
  const paginaScans = datosGlobales.slice(inicio, fin);

  let rows = "";

  paginaScans.forEach((scan) => {
    const fotos = scan.fotos ?? [];
    const thumbnail = fotos.length ? fotos[0] : null; // Solo la primera foto

    if (!scan.damages.length) {
      rows += `
        <tr>
          <td>${scan.scan_id}</td>
          <td>${scan.vin}</td>
          <td colspan="5" class="text-center">Sin daños</td>
          <td>
            ${
              thumbnail
                ? `
              <a href="${thumbnail}" class="glightbox" data-gallery="gallery-${scan.scan_id}">
                <img src="${thumbnail}" class="img-thumbnail" style="width:60px;height:60px;object-fit:cover;" />
              </a>
            `
                : ""
            }
          </td>
        </tr>
      `;
    } else {
      scan.damages.forEach((d) => {
        rows += `
          <tr>
            <td>${scan.scan_id}</td>
            <td>${scan.vin}</td>
            <td>${d.area ?? ""}</td>
            <td>${d.averia ?? ""}</td>
            <td>${d.grav ?? ""}</td>
            <td>${d.obs ?? ""}</td>
            <td>${d.codigo ?? ""}</td>
            <td>
              ${
                thumbnail
                  ? `
                <a href="${thumbnail}" class="glightbox" data-gallery="gallery-${scan.scan_id}">
                  <img src="${thumbnail}" class="img-thumbnail" style="width:60px;height:60px;object-fit:cover;" />
                </a>
              `
                  : ""
              }
            </td>
          </tr>
        `;
      });
    }

    // Agregar las demás fotos a la galería pero ocultas
    if (fotos.length > 1) {
      fotos.slice(1).forEach((f) => {
        rows += `<a href="${f}" class="glightbox" data-gallery="gallery-${scan.scan_id}" style="display:none;"></a>`;
      });
    }
  });

  document.getElementById("resultados").innerHTML = `
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>VIN</th>
          <th>Área</th>
          <th>Avería</th>
          <th>Gravedad</th>
          <th>Observación</th>
          <th>Código</th>
          <th>Fotos</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  // Inicializar GLightbox
  if (typeof GLightbox !== "undefined") {
    if (lightboxInstance) lightboxInstance.destroy();
    lightboxInstance = GLightbox({
      selector: ".glightbox",
      loop: true,
      zoomable: true,
      touchNavigation: true,
      keyboardNavigation: true,
      returnFocus: false,
    });
  }
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
    <li class="page-item ${paginaActual === totalPaginas ? "disabled" : ""}">
      <button class="page-link" onclick="cambiarPagina(${
        paginaActual + 1
      })">Siguiente</button>
    </li>
  `;

  html += `</ul></nav>`;
  document.getElementById("paginacion").innerHTML = html;
}

// Cambiar página
function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(datosGlobales.length / FILAS_POR_PAGINA);
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
  paginaActual = nuevaPagina;
  mostrarSpinner();
  setTimeout(() => {
    renderTabla();
    renderPaginacion();
  }, 100);
}

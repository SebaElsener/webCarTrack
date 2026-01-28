import areas from "../utils/areas.json" with { type: "json" };
import averias from "../utils/averias.json" with { type: "json" };
import gravedades from "../utils/gravedades.json" with { type: "json" };

const indexById = (arr) =>
  Object.fromEntries(arr.map((i) => [i.id, i.descripcion]));

const areasMap = indexById(areas);
const averiasMap = indexById(averias);
const gravedadesMap = indexById(gravedades);
const fotosPorVin = {};
let accionesPostTablaMostradas = false;
let filtros = {
  marca: [],
  modelo: [],
  batea: [],
  topAreas: false,
  topAverias: false,
  soloConDanio: false,
  movimiento: null,
  areaSeleccionada: null,
  averiaSeleccionada: null,
};

const navBarMin = document.getElementById("navBarMin");
navBarMin.style.top = "0";
const dropdownContent = document.getElementById("dropdownContent");
dropdownContent.style.marginTop = "0";

document.getElementById("form-fechas").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fechas = document.getElementById("rangoFechas").value.split(" a ");
  if (fechas.length !== 2) {
    toastError("Seleccioná un rango válido");
    return;
  }

  const [desde, hasta] = fechas;
  cargarDatos(desde, hasta);
});

function renderTablaConPaginacion(data) {
  renderTabla();

  requestAnimationFrame(() => {
    renderPaginacion();
  });
}

function renderInicialTabla(data) {
  datosFiltrados = data;
  paginaActual = 1;
  renderTablaConPaginacion();
}

const FILAS_POR_PAGINA = 15;
let paginaActual = 1;
let datosGlobales = [];
let datosBaseFiltrados = [];
let datosTabla = [];

function cargarMarcas() {
  const marcas = [
    ...new Set(datosGlobales.map((d) => d.marca).filter(Boolean)),
  ].sort();

  choicesMarca.clearChoices();
  choicesMarca.setChoices(
    marcas.map((m) => ({ value: m, label: m })),
    "value",
    "label",
    true,
  );
}

function cargarModelos(marcasSeleccionadas = []) {
  let modelos;

  if (marcasSeleccionadas.length) {
    modelos = [
      ...new Set(
        datosGlobales
          .filter((d) => marcasSeleccionadas.includes(d.marca))
          .map((d) => d.modelo)
          .filter(Boolean),
      ),
    ];
  } else {
    modelos = [...new Set(datosGlobales.map((d) => d.modelo).filter(Boolean))];
  }

  choicesModelo.clearChoices();
  choicesModelo.setChoices(
    modelos.sort().map((m) => ({ value: m, label: m })),
    "value",
    "label",
    true,
  );
}

function cargarBateas() {
  const bateas = [
    ...new Set(datosGlobales.map((d) => d.batea).filter(Boolean)),
  ].sort();

  choicesBatea.clearChoices();
  choicesBatea.setChoices(
    bateas.map((m) => ({ value: m, label: m })),
    "value",
    "label",
    true,
  );
}

// Función para mostrar spinner
function mostrarSpinner() {
  document.getElementById("evolucion").style.display = "none";
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
  datosFiltrados = [];

  document.getElementById("chkTopAreas").checked = false;
  document.getElementById("chkTopAverias").checked = false;
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
        document.getElementById("filtersCard").style.display = "none";
        document.getElementById("estadisticas").style.display = "none";
        document.getElementById("evolucion").style.display = "none";
        document.getElementById("actionsBar").style.display = "none";
        accionesPostTablaMostradas = false;

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

      datosGlobales.forEach((scan) => {
        if (!scan.vin || !scan.fotos?.length) return;

        if (!fotosPorVin[scan.vin]) {
          fotosPorVin[scan.vin] = [];
        }

        scan.fotos.forEach((url) => {
          fotosPorVin[scan.vin].push({
            href: url,
            type: "image",
            title: `VIN ${scan.vin}`,
          });
        });
      });

      paginaActual = 1;
      cargarMarcas();
      cargarModelos();
      cargarBateas();
      aplicarFiltros();
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
  mostrarAccionesPostTabla();

  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
  const fin = inicio + FILAS_POR_PAGINA;
  const paginaDatos = datosFiltrados.slice(inicio, fin);

  let rows = "";

  // <td class="text-center">
  //   ${
  //     scan.fotos?.length
  //       ? scan.fotos
  //           .map(
  //             (f, idx) => `
  //               <a
  //                 href="${f}"
  //                 class="glightbox"
  //                 data-gallery="gallery-${scan.scan_id}"
  //                 data-title="Imagen ${idx + 1} de ${scan.fotos.length}"
  //                 ${idx > 0 ? 'style="display:none"' : ""}
  //               >
  //                 ${
  //                   idx === 0
  //                     ? `<i class="bi bi-camera-fill" style="font-size:1.2rem;color:#007bff;"></i>`
  //                     : ""
  //                 }
  //               </a>
  //             `,
  //           )
  //           .join("")
  //       : ""
  //   }
  // </td>

  paginaDatos.forEach((scan) => {
    if (!scan.damages || scan.damages.length === 0) {
      rows += `
        <tr>
          <td>${new Date(scan.scan_date).toLocaleString("es-AR")}</td>
          <td>${scan.marca ?? ""}</td>
          <td>${scan.modelo ?? ""}</td>
          <td>${scan.vin ?? ""}</td>
          <td colspan="4" class="text-center">Sin daños</td>
          <td>${scan.batea ?? ""}</td>
          <td>${renderClimaIcon(scan.clima)}</td>
          <td>${scan.user ?? ""}</td>
          <td class="text-center">
            ${
              scan.fotos?.length
                ? `
                  <button
                    class="btn btn-link p-0 open-gallery"
                    data-vin="${scan.vin}"
                    data-start="0"
                  >
                    <i class="bi bi-camera-fill" style="font-size:1.2rem;color:#007bff;"></i>
                  </button>
                `
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
            <td>${scan.batea ?? ""}</td>
            <td>${renderClimaIcon(scan.clima)}</td>
            <td>${scan.user ?? ""}</td>
           <td class="text-center">
            ${
              scan.fotos?.length
                ? `
                  <button
                    class="btn btn-link p-0 open-gallery"
                    data-vin="${scan.vin}"
                    data-start="0"
                  >
                    <i class="bi bi-camera-fill" style="font-size:1.2rem;color:#007bff;"></i>
                  </button>
                `
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
            <th id="marcaTh">Marca</th>
            <th id="modeloTh">Modelo</th>
            <th class="VINth">VIN</th>
            <th class="areaTh">Area</th>
            <th class="averiaTh">Avería</th>
            <th class="gravTh">Gravedad</th>
            <th>Observación</th>
            <th class="bateaTh">Batea</th>
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
  const table = document.getElementById("tabla-resultados");
  table.querySelectorAll("th").forEach((th) => {
    th.style.width = th.scrollWidth + 20 + "px";
  });

  // 🔹 Activar resize manual
  enableColumnResize("tabla-resultados");

  // 🔹 Inicializar GLightbox
  // GLightbox({
  //   selector: ".glightbox",
  //   loop: true,
  //   zoomable: true,
  //   touchNavigation: true,
  //   keyboardNavigation: true,
  //   returnFocus: false,
  // });
  const lightbox = GLightbox({
    selector: ".glightbox",
    loop: true,
    zoomable: true,
    touchNavigation: true,
    keyboardNavigation: true,
    closeOnOutsideClick: true,
    draggable: true,
  });
}

// Render de paginación
function renderPaginacion() {
  const totalPaginas = Math.ceil(datosFiltrados.length / FILAS_POR_PAGINA);

  if (totalPaginas <= 1) {
    document.getElementById("paginacion").innerHTML = "";
    return;
  }

  let html = `<nav><ul class="pagination justify-content-center">`;

  html += `
    <li class="page-item ${paginaActual === 1 ? "disabled" : ""}">
      <button class="page-link" data-page="${
        paginaActual - 1
      }">Anterior</button>
    </li>
  `;

  for (let i = 1; i <= totalPaginas; i++) {
    html += `
      <li class="page-item ${paginaActual === i ? "active" : ""}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `;
  }

  html += `
    <li class="page-item ${paginaActual === totalPaginas ? "disabled" : ""}">
      <button class="page-link" data-page="${
        paginaActual + 1
      }">Siguiente</button>
    </li>
  `;

  html += `</ul></nav>`;
  document.getElementById("paginacion").innerHTML = html;

  // 🔹 Listener único
  document.querySelectorAll("#paginacion button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cambiarPagina(Number(btn.dataset.page));
    });
  });
}

// Cambiar de página con spinner
function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(datosFiltrados.length / FILAS_POR_PAGINA);
  if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;

  paginaActual = nuevaPagina;

  const tabla = document.getElementById("resultados");
  const stats = document.getElementById("estadisticas");
  if (!tabla || !stats) return;

  // 🔹 Animación fade-out
  tabla.classList.add("fade-out");
  stats.classList.add("fade-out");

  setTimeout(() => {
    // 🔹 Render de tabla y paginación de la nueva página
    renderTablaConPaginacion();

    // 🔹 Entrada animada
    tabla.classList.remove("fade-out");
    stats.classList.remove("fade-out");

    tabla.classList.add("fade-in");
    stats.classList.add("fade-in");

    setTimeout(() => {
      tabla.classList.remove("fade-in");
      stats.classList.remove("fade-in");
    }, 300);

    enableColumnResize("tabla-resultados");
  }, 200);
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

document.getElementById("filtroMarca").addEventListener("change", (e) => {
  filtros.marca = Array.from(e.target.selectedOptions).map((o) => o.value);

  filtros.modelo = [];
  cargarModelos(filtros.marca);
  choicesModelo.removeActiveItems();

  filtros.areaSeleccionada = null;
  filtros.averiaSeleccionada = null;

  aplicarFiltros();
});

document.getElementById("filtroModelo").addEventListener("change", (e) => {
  filtros.modelo = Array.from(e.target.selectedOptions).map((o) => o.value);

  filtros.areaSeleccionada = null;
  filtros.averiaSeleccionada = null;

  aplicarFiltros();
});

document.getElementById("filtroBatea").addEventListener("change", (e) => {
  filtros.batea = Array.from(e.target.selectedOptions).map((o) => o.value);

  filtros.areaSeleccionada = null;
  filtros.averiaSeleccionada = null;

  aplicarFiltros();
});

document.getElementById("chkTopAreas").addEventListener("change", (e) => {
  filtros.topAreas = e.target.checked;
  aplicarFiltros();
});

document.getElementById("chkTopAverias").addEventListener("change", (e) => {
  filtros.topAverias = e.target.checked;
  aplicarFiltros();
});

document.getElementById("movAll").addEventListener("change", () => {
  filtros.movimiento = null;
  aplicarFiltros();
});

document.getElementById("movIngreso").addEventListener("change", () => {
  filtros.movimiento = "INGRESO";
  aplicarFiltros();
});

document.getElementById("movDespacho").addEventListener("change", () => {
  filtros.movimiento = "DESPACHO";
  aplicarFiltros();
});

function aplicarFiltros() {
  const tabla = document.getElementById("resultados");
  const stats = document.getElementById("estadisticas");

  // 🔹 Animación salida
  tabla?.classList.add("fade-out");
  stats?.classList.add("fade-out");

  setTimeout(() => {
    let dataBase = [...datosGlobales];

    //filtro marca
    if (filtros.marca.length) {
      dataBase = dataBase.filter((d) => filtros.marca.includes(d.marca));
    }

    // filtro modelo
    if (filtros.modelo.length) {
      dataBase = dataBase.filter((d) => filtros.modelo.includes(d.modelo));
    }

    // filtro batea
    if (filtros.batea.length) {
      dataBase = dataBase.filter((d) => filtros.batea.includes(d.batea));
    }

    // 🔹 Solo VIN con daño
    if (filtros.soloConDanio)
      dataBase = dataBase.filter((scan) => scan.damages?.length);

    // Filtrar por ingreso o despacho
    if (filtros.movimiento) {
      dataBase = dataBase.filter(
        (scan) => scan.movimiento === filtros.movimiento,
      );
    }

    // 🔹 Badge contador
    const badge = document.getElementById("badgeConDanio");
    if (filtros.soloConDanio) {
      badge.textContent = `${dataBase.length} VIN con daño`;
      badge.classList.remove("d-none");
    } else {
      badge.classList.add("d-none");
    }

    badge.classList.add("show");
    setTimeout(() => badge.classList.remove("show"), 200);

    datosBaseFiltrados = dataBase;

    let dataTablaLocal = [...datosBaseFiltrados];

    if (filtros.areaSeleccionada) {
      dataTablaLocal = dataTablaLocal
        .map((scan) => {
          const filteredDamages = scan.damages?.filter(
            (d) => d.area === filtros.areaSeleccionada,
          );
          if (filteredDamages && filteredDamages.length) {
            return { ...scan, damages: filteredDamages };
          }
          return null;
        })
        .filter(Boolean);
    }

    if (filtros.averiaSeleccionada) {
      dataTablaLocal = dataTablaLocal
        .map((scan) => {
          const filteredDamages = scan.damages?.filter(
            (d) => d.averia === filtros.averiaSeleccionada,
          );
          if (filteredDamages && filteredDamages.length) {
            return { ...scan, damages: filteredDamages };
          }
          return null;
        })
        .filter(Boolean);
    }

    datosTabla = dataTablaLocal;

    // 🔹 Reset página
    paginaActual = 1;

    // 🔹 Render
    renderEstadisticas(datosBaseFiltrados);
    renderInicialTabla(datosTabla);
    renderEvolucion(datosBaseFiltrados);

    // 🔹 Entrada animada
    tabla?.classList.remove("fade-out");
    stats?.classList.remove("fade-out");

    tabla?.classList.add("fade-in");
    stats?.classList.add("fade-in");

    setTimeout(() => {
      tabla?.classList.remove("fade-in");
      stats?.classList.remove("fade-in");
    }, 300);
  }, 200);
}

function renderEstadisticas(data) {
  const cont = document.getElementById("estadisticas");
  if (!cont) return;
  cont.innerHTML = "";

  if (filtros.topAreas) {
    const totalAreas = data.reduce((acc, scan) => {
      scan.damages?.forEach((d) => {
        if (!d.area) return;

        if (!acc[d.area]) {
          acc[d.area] = {
            id: d.area,
            label: d.area_desc,
            value: 0,
          };
        }

        acc[d.area].value++;
      });
      return acc;
    }, {});

    const top = Object.values(totalAreas)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    cont.innerHTML += renderMiniChartList(
      "Top 5 Áreas dañadas",
      top,
      Object.values(totalAreas).reduce((acc, item) => acc + item.value, 0),
      "area",
    );
  }

  if (filtros.topAverias) {
    const totalAverias = data.reduce((acc, scan) => {
      scan.damages?.forEach((d) => {
        if (!d.averia) return;

        if (!acc[d.averia]) {
          acc[d.averia] = {
            id: d.averia,
            label: d.averia_desc,
            value: 0,
          };
        }

        acc[d.averia].value++;
      });
      return acc;
    }, {});

    const top = Object.values(totalAverias)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    cont.innerHTML += renderMiniChartList(
      "Top 5 Tipos de daño",
      top,
      Object.values(totalAverias).reduce((acc, item) => acc + item.value, 0),
      "averia",
    );
  }

  animateMiniCharts();
}

function renderMiniChartList(titulo, lista, total, tipo) {
  const totalTop = lista.reduce((acc, item) => acc + item.value, 0);

  return `
    <div class="mini-chart card mb-2 fade-slide">
      <div class="card-body py-2">
        <h6 class="card-title text-primary fw-semibold mt-2 mb-3">
          ${titulo}
        </h6>

        ${
          lista.length
            ? lista
                .map((item) => {
                  const { id, label, value } = item;
                  const pctGlobal = ((value / total) * 100).toFixed(1);
                  const pctTop = ((value / totalTop) * 100).toFixed(1);

                  return `
                    <div 
                      class="mini-bar-row d-flex align-items-center mb-2 clickable"
                      data-tipo="${tipo}"
                      data-id="${id}"
                    >
                      <div class="label text-truncate" title="${label}">
                        ${label}
                      </div>

                      <div class="bar-wrapper">
                        <div class="bar" data-width="${pctGlobal}"></div>

                        <div class="mini-tooltip">
                          <strong>${label}</strong><br>
                          ${value} casos<br>
                          <span class="pct">
                            ${pctGlobal}% global · ${pctTop}% top 5
                          </span>
                        </div>
                      </div>

                      <div class="value">${value}</div>
                    </div>
                  `;
                })
                .join("")
            : `<span class="text-muted">Sin datos</span>`
        }
      </div>
    </div>
  `;
}

// 🔹 Activar animación de width al insertar el HTML
function animateMiniCharts() {
  document.querySelectorAll(".bar").forEach((bar) => {
    const width = bar.dataset.width;
    if (!width) return;

    // reset explícito
    bar.style.width = "0%";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = width + "%";
      });
    });
  });
}

let datosFiltrados = [];

function agruparPorFecha(scans) {
  const map = {};

  scans.forEach((scan) => {
    const fecha = scan.scan_date.split("T")[0];
    const cantidad = scan.damages?.length || 0;

    map[fecha] = (map[fecha] || 0) + cantidad;
  });

  return Object.entries(map).sort((a, b) => new Date(a[0]) - new Date(b[0]));
}

function renderEvolucion(data) {
  document.getElementById("evolucion").style.display = "block";

  const cont = document.getElementById("evolucion");
  cont.innerHTML = "";

  const serie = agruparPorFecha(data);
  if (!serie.length) return;

  const max = Math.max(...serie.map(([, v]) => v), 1);

  cont.innerHTML = `
    <div class="card shadow-sm mt-3 fade-slide">
      <div class="card-body">
        <h6 class="card-title text-primary fw-semibold">
          Evolución de daños por fecha
        </h6>

        <div class="timeline mt-3">
          ${serie
            .map(([fecha, v]) => {
              const h = Math.round((v / max) * 100);
              return `
                <div class="timeline-bar" style="height:${h}%">
                  <span>${fecha}</span>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

document.addEventListener("mousemove", (e) => {
  const wrapper = e.target.closest(".bar-wrapper");
  if (!wrapper) return;

  const tooltip = wrapper.querySelector(".mini-tooltip");
  if (!tooltip) return;

  const rect = wrapper.getBoundingClientRect();
  let x = e.clientX - rect.left;

  // límites
  x = Math.max(10, Math.min(x, rect.width - 10));

  tooltip.style.left = x + "px";
});

document.getElementById("chkSoloConDanio").addEventListener("change", (e) => {
  filtros.soloConDanio = e.target.checked;
  aplicarFiltros();
});

document.addEventListener("click", (e) => {
  const row = e.target.closest(".mini-bar-row.clickable");
  if (!row) return;

  const tipo = row.dataset.tipo;
  const id = row.dataset.id;

  // toggle
  const yaActivo =
    (tipo === "area" && filtros.areaSeleccionada === id) ||
    (tipo === "averia" && filtros.averiaSeleccionada === id);

  filtros.areaSeleccionada = null;
  filtros.averiaSeleccionada = null;

  if (!yaActivo) {
    if (tipo === "area") filtros.areaSeleccionada = id;
    if (tipo === "averia") filtros.averiaSeleccionada = id;
  }

  // feedback visual
  document
    .querySelectorAll(".mini-bar-row")
    .forEach((r) => r.classList.remove("active"));

  if (!yaActivo) row.classList.add("active");

  aplicarFiltros();
});

document.getElementById("btnLimpiarFiltros").addEventListener("click", () => {
  limpiarFiltros();
});

const limpiarFiltros = () => {
  // 🔹 Reset filtros
  filtros.marca = [];
  filtros.modelo = [];
  filtros.batea = [];
  filtros.soloConDanio = false;
  filtros.movimiento = null;
  filtros.areaSeleccionada = null;
  filtros.averiaSeleccionada = null;
  filtros.topAreas = false;
  filtros.topAverias = false;

  // 🔹 Reset elementos del DOM
  choicesMarca.removeActiveItems();
  choicesModelo.removeActiveItems();
  choicesBatea.removeActiveItems();
  document.getElementById("chkSoloConDanio").checked = false;
  document.getElementById("movAll").checked = true;
  document.getElementById("chkTopAreas").checked = false;
  document.getElementById("chkTopAverias").checked = false;
  document
    .querySelectorAll(".mini-bar-row")
    .forEach((r) => r.classList.remove("active"));

  aplicarFiltros();
};

document.getElementById("btnExportPdf").addEventListener("click", async () => {
  const btn = document.getElementById("btnExportPdf");

  await withBootstrapButtonLock(btn, async () => {
    const payload = buildExportPayload();

    const res = await fetch("/api/export/reportesPDF", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition");
    let fileName = "reporte.pdf";

    if (disposition) {
      const match = disposition.match(/filename="(.+)"/);
      if (match?.[1]) fileName = match[1];
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
  });
});

document
  .getElementById("btnExportExcel")
  .addEventListener("click", async () => {
    const btn = document.getElementById("btnExportExcel");

    withBootstrapButtonLock(btn, async () => {
      const payload = buildExportPayload();

      const res = await fetch("/api/export/reportesExcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const blob = await res.blob();
      // 👇 leer filename real
      const disposition = res.headers.get("Content-Disposition");
      let fileName = "reporte.xlsx";

      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match?.[1]) fileName = match[1];
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = fileName;
      a.click();

      URL.revokeObjectURL(url);
    });
  });

function buildStats(data) {
  const areas = {};
  const averias = {};

  data.forEach((scan) => {
    scan.damages?.forEach((d) => {
      if (d.area) {
        areas[d.area_desc] = (areas[d.area_desc] || 0) + 1;
      }
      if (d.averia) {
        averias[d.averia_desc] = (averias[d.averia_desc] || 0) + 1;
      }
    });
  });

  return {
    totalVIN: data.length,
    conDanio: data.filter((s) => s.damages?.length).length,
    areasTop: Object.entries(areas)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    averiasTop: Object.entries(averias)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
  };
}

function buildExportPayload() {
  const stats = buildStats(datosTabla);

  return {
    datos: datosTabla.map((s) => ({
      fecha: s.scan_date,
      marca: s.marca,
      modelo: s.modelo,
      batea: s.batea,
      movimiento: s.movimiento,
      vin: s.vin,
      areas: s.damages?.map((d) => d.area_desc).join(", "),
      averias: s.damages?.map((d) => d.averia_desc).join(", "),
    })),
    topAreas: stats.areasTop,
    topAverias: stats.averiasTop,
    evolucion: agruparPorFecha(datosTabla).map(([fecha, value]) => ({
      fecha,
      value,
    })),
  };
}

function mostrarAccionesPostTabla() {
  if (accionesPostTablaMostradas) return;
  document.getElementById("filtersCard").style.display = "flex";
  document.getElementById("estadisticas").style.display = "flex";
  document.getElementById("actionsBar").style.display = "flex";
  document.getElementById("evolucion").style.display = "block";

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

async function withBootstrapButtonLock(button, action) {
  if (button.disabled) return;

  const originalHtml = button.innerHTML;

  button.disabled = true;
  button.classList.add("disabled");
  button.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    Generando...
  `;

  try {
    await action();
  } catch (err) {
    console.error(err);
    toastError("Error al generar el archivo");
  } finally {
    button.disabled = false;
    button.classList.remove("disabled");
    button.innerHTML = originalHtml;
  }
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".open-gallery");
  if (!btn) return;

  const vin = btn.dataset.vin;
  if (!vin || !fotosPorVin[vin]) return;

  const lightbox = GLightbox({
    elements: fotosPorVin[vin],
    loop: true,
    zoomable: true,
    draggable: true,
    preload: true, // 🔥 clave
  });

  lightbox.open();
});

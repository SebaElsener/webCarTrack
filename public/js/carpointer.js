import {
  obtenerPuntosDelViaje,
  openMapWithRoute,
  animarSuave,
  pausarAnimacion,
} from "./carpointer-gps.js";

const indexById = (arr) =>
  Object.fromEntries(arr.map((i) => [i.id, i.descripcion]));

let accionesPostTablaMostradas = false;
let fotosPorVin = {};
let vinsConFotos = new Set();
let filtros = {
  marca: [],
  modelo: [],
  batea: [],
  origen: [],
  destino: [],
  movimiento: null,
  bateaSeleccionada: null,
};
let vinSeleccionado = null;

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

// Función para cargar datos desde el servidor
async function cargarDatos(desde, hasta) {
  mostrarSpinner();
  datosFiltrados = [];

  await fetch("/api/carpointer/querybydate", {
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
        document.getElementById("actionsBar").style.display = "none";
        accionesPostTablaMostradas = false;

        return;
      }

      fotosPorVin = {};
      vinsConFotos.clear();

      data.forEach((scan) => {
        if (scan.fotos?.length) {
          fotosPorVin[scan.vin] = scan.fotos.map((f, idx) => ({
            href: f,
            type: "image",
            title: `VIN ${scan.vin} · ${scan.movimiento} en ${scan.lugar} ·  ${new Date(
              scan.scan_date,
            ).toLocaleString("es-AR", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })} · Imagen ${idx + 1}`,
          }));

          vinsConFotos.add(scan.vin);
        }
      });

      const transformScans = data.map((scan) => ({
        ...scan,
      }));

      datosGlobales = transformScans;

      paginaActual = 1;
      cargarMarcas();
      cargarModelos();
      cargarBateas();
      cargarOrigenes();
      cargarDestinos();
      aplicarFiltros();
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("resultados").innerHTML =
        "<p class='text-danger'>Error al obtener los datos</p>";
      document.getElementById("paginacion").innerHTML = "";
    });
}

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

function cargarOrigenes() {
  const origenes = [
    ...new Set(datosGlobales.map((d) => d.origen).filter(Boolean)),
  ].sort();

  choicesOrigenes.clearChoices();
  choicesOrigenes.setChoices(
    origenes.map((l) => ({ value: l, label: l })),
    "value",
    "label",
    true,
  );
}

function cargarDestinos() {
  const destinos = [
    ...new Set(datosGlobales.map((d) => d.destino).filter(Boolean)),
  ].sort();

  choicesDestino.clearChoices();

  choicesDestino.setChoices(
    destinos.map((d) => ({ value: d, label: d })),
    "value",
    "label",
    true,
  );
}

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

// Render de tabla
function renderTabla() {
  mostrarAccionesPostTabla();

  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
  const fin = inicio + FILAS_POR_PAGINA;
  const paginaDatos = datosFiltrados.slice(inicio, fin);

  let rows = "";

  paginaDatos.forEach((scan) => {
    rows += `
        <tr>
          <td>${new Date(scan.scan_date).toLocaleString("es-AR", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}</td>
          <td>${scan.marca ?? ""}</td>
          <td>${scan.modelo ?? ""}</td>
          <td>
            ${
              vinsConFotos.has(scan.vin)
                ? `
                  <a
                    href="#"
                    class="vin-link open-gallery"
                    data-vin="${scan.vin}"
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
          <td>
            ${
              scan.gps_stamp
                ? `
                  <button 
                    class="btn btn-sm btn-outline-primary open-map" 
                    data-gps='${scan.gps_stamp}'
                    data-scanid='${scan.scan_id}'
                    title="Ver en mapa (${scan.gps_stamp})"
                  >
                    📍
                  </button>
                `
                : ""
            }
          </td>
          <td>${scan.batea ?? ""}</td>
          <td>${scan.movimiento ?? ""}</td>
          <td>${scan.origen ?? ""}</td>
          <td>${scan.destino ?? ""}</td>
        </tr>
      `;
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
            <th class="marcaTh">Marca</th>
            <th class="modeloTh">Modelo</th>
            <th class="VINth">VIN</th>
            <th class="gpsTh">GPS</th>
            <th class="bateaTh">Batea</th>
            <th class="movimientoTh">Movimiento</th>
            <th class="lugarTh">Origen</th>
            <th class="destinoTh">Destino</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  const table = document.getElementById("tabla-resultados");

  /* anchos iniciales por columna */
  const initialWidths = {
    dateTh: 140,
    marcaTh: 100,
    modeloTh: 120,
    VINth: 200,
    gpsTh: 60,
    bateaTh: 60,
    movimientoTh: 90,
    lugarTh: 150,
    destinoTh: 200,
  };

  Object.entries(initialWidths).forEach(([cls, width]) => {
    const th = table.querySelector(`th.${cls}`);
    if (th) th.style.width = `${width}px`;
  });

  // 🔹 Activar resize manual
  enableColumnResize("tabla-resultados");
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
  if (!tabla) return;

  // 🔹 Animación fade-out
  tabla.classList.add("fade-out");

  setTimeout(() => {
    // 🔹 Render de tabla y paginación de la nueva página
    renderTablaConPaginacion();

    // 🔹 Entrada animada
    tabla.classList.remove("fade-out");

    tabla.classList.add("fade-in");

    setTimeout(() => {
      tabla.classList.remove("fade-in");
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

document.getElementById("filtroMarca").addEventListener("change", (e) => {
  filtros.marca = Array.from(e.target.selectedOptions).map((o) => o.value);

  filtros.modelo = [];
  cargarModelos(filtros.marca);
  choicesModelo.removeActiveItems();

  aplicarFiltros();
});

document.getElementById("filtroModelo").addEventListener("change", (e) => {
  filtros.modelo = Array.from(e.target.selectedOptions).map((o) => o.value);

  aplicarFiltros();
});

document.getElementById("filtroBatea").addEventListener("change", (e) => {
  filtros.batea = Array.from(e.target.selectedOptions).map((o) => o.value);

  aplicarFiltros();
});

document.getElementById("movCarga").addEventListener("change", () => {
  filtros.movimiento = "CARGA";

  aplicarFiltros();
});

document.getElementById("movDescarga").addEventListener("change", () => {
  filtros.movimiento = "DESCARGA";

  aplicarFiltros();
});

document.getElementById("movAll").addEventListener("change", () => {
  filtros.movimiento = null;

  filtros.origen = [];
  choicesOrigenes.removeActiveItems();

  aplicarFiltros();
});

document.getElementById("filtroOrigen").addEventListener("change", (e) => {
  filtros.origen = Array.from(e.target.selectedOptions).map((o) => o.value);
  aplicarFiltros();
});

document.getElementById("filtroDestino").addEventListener("change", (e) => {
  filtros.destino = Array.from(e.target.selectedOptions).map((o) => o.value);
  aplicarFiltros();
});

function aplicarFiltros() {
  const tabla = document.getElementById("resultados");

  // 🔹 Animación salida
  tabla?.classList.add("fade-out");

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

    // 🔹 Filtro movimiento
    if (filtros.movimiento === "CARGA") {
      dataBase = dataBase.filter((scan) => scan.movimiento === "CARGA");
    }

    if (filtros.movimiento === "DESCARGA") {
      dataBase = dataBase.filter((scan) => scan.movimiento === "DESCARGA");
    }

    if (filtros.origen.length) {
      dataBase = dataBase.filter((scan) =>
        filtros.origen.includes(scan.origen),
      );
    }

    if (filtros.destino.length) {
      dataBase = dataBase.filter((scan) =>
        filtros.destino.includes(scan.destino),
      );
    }

    datosBaseFiltrados = dataBase;

    let dataTablaLocal = [...datosBaseFiltrados];

    if (filtros.bateaSeleccionada) {
      dataTablaLocal = dataTablaLocal.filter(
        (scan) => scan.batea === filtros.bateaSeleccionada,
      );
    }

    datosTabla = dataTablaLocal;

    // 🔹 Reset página
    paginaActual = 1;

    // 🔹 Render
    renderInicialTabla(datosTabla);

    // 🔹 Entrada animada
    tabla?.classList.remove("fade-out");
    tabla?.classList.add("fade-in");

    setTimeout(() => {
      tabla?.classList.remove("fade-in");
    }, 300);
  }, 200);
}

let datosFiltrados = [];

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

document.getElementById("btnLimpiarFiltros").addEventListener("click", () => {
  limpiarFiltros();
});

const limpiarFiltros = () => {
  // 🔹 Reset filtros internos
  filtros.marca = [];
  filtros.modelo = [];
  filtros.batea = [];
  filtros.origen = [];
  filtros.destino = [];
  filtros.movimiento = null;
  filtros.bateaSeleccionada = null;

  // 🔹 Reset selects Choices
  choicesMarca.removeActiveItems();
  choicesModelo.removeActiveItems();
  choicesBatea.removeActiveItems();
  choicesOrigenes.removeActiveItems();
  choicesDestino.removeActiveItems();

  // 🔹 Reset movimiento (radio)
  document.getElementById("movAll").checked = true;

  aplicarFiltros();
};

function mostrarAccionesPostTabla() {
  if (accionesPostTablaMostradas) return;
  document.getElementById("filtersCard").style.display = "flex";
  document.getElementById("actionsBar").style.display = "flex";

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

document.getElementById("btnVerMapa").addEventListener("click", () => {
  const puntos = obtenerPuntosDelViaje(datosTabla);

  if (!puntos.length) {
    alert("No hay datos GPS para mostrar");
    return;
  }
  openMapWithRoute(puntos);
});

document.getElementById("btnAnimarMapa").addEventListener("click", () => {
  const puntos = obtenerPuntosDelViaje(datosTabla);
  animarSuave(puntos);
});

document.getElementById("btnPauseMapa").addEventListener("click", () => {
  pausarAnimacion();
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".open-map");
  if (!btn) return;

  const scanId = btn.dataset.scanid;
  const puntos = obtenerPuntosDelViaje(datosTabla);

  openMapWithRoute(puntos, scanId);
});

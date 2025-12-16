

document.getElementById("form-fechas").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fechas = document.getElementById("rangoFechas").value.split(" to ");
    if (fechas.length !== 2) {
      alert("Seleccioná un rango válido");
      return;
    }

    const [desde, hasta] = fechas

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
function cargarDatos(desde, hasta) {
    mostrarSpinner();

    fetch('/api/querys/queryByDate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desde, hasta })
    })
    .then(res => res.json())
    .then(data => {
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
    .catch(err => {
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

    const rows = paginaDatos.map(item => `
        <tr>
            <td>${item.type ?? ""}</td>
            <td>${item.code ?? ""}</td>
            <td>${item.area ?? ""}</td>
            <td>${item.averia ?? ""}</td>
            <td>${item.grav ?? ""}</td>
            <td>${item.obs ?? ""}</td>
            <td>${item.codigo ?? ""}</td>
            <td>${item.date ? new Date(item.date).toLocaleDateString() : ""}</td>
        </tr>
    `).join("");

    document.getElementById("resultados").innerHTML = `
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>Modelo</th>
                    <th>VIN</th>
                    <th>Área</th>
                    <th>Avería</th>
                    <th>Gravedad</th>
                    <th>Observación</th>
                    <th>Código</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// Render de paginación
function renderPaginacion() {
    const totalPaginas = Math.ceil(datosGlobales.length / FILAS_POR_PAGINA);
    let html = `<nav><ul class="pagination justify-content-center">`;

    html += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="cambiarPagina(${paginaActual - 1})">Anterior</button>
        </li>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        html += `
            <li class="page-item ${paginaActual === i ? 'active' : ''}">
                <button class="page-link" onclick="cambiarPagina(${i})">${i}</button>
            </li>
        `;
    }

    html += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <button class="page-link" onclick="cambiarPagina(${paginaActual + 1})">Siguiente</button>
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

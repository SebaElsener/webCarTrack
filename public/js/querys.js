
document.getElementById("form-fechas").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fechas = document.getElementById("rangoFechas").value.split(" to ");
    if (fechas.length !== 2) {
      alert("Seleccioná un rango válido");
      return;
    }

    const [desde, hasta] = fechas

fetch('/api/querys/queryByDate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ desde, hasta })
})
.then(res => res.json())
.then(data => {
    console.log(data);

    const resultadosDiv = document.getElementById("resultados");
    resultadosDiv.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        resultadosDiv.innerHTML =
            "<p class='text-muted'>No se encontraron datos en el rango seleccionado</p>";
        return;
    }

    const rows = data.map(item => `
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

    resultadosDiv.innerHTML = `
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
})
.catch(err => {
    console.error(err);
    document.getElementById("resultados").innerHTML =
        "<p class='text-danger'>Error al obtener los datos</p>";
});

        });
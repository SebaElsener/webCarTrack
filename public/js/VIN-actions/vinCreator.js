export async function crearNuevoVIN(vin) {
  const res = await fetch("/api/scans/create-new-vin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vin }),
  });

  if (!res.ok) throw new Error("Error creando VIN");

  return await res.json();
}

export async function manejarVINNoEncontrado(vin) {
  const confirmed = await confirmModal({
    title: "VIN no encontrado",
    body: `
      <p class="mb-2">
        No se encontraron datos para:
      </p>
      <p class="fw-bold">${vin}</p>
      <p class="mb-0">
        ¿Desea agregarlo como nuevo VIN?
      </p>
    `,
    confirmText: "Agregar VIN",
    confirmClass: "btn-primary",
  });

  if (!confirmed) return null;

  return await crearNuevoVIN(vin);
}

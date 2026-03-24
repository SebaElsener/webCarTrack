export async function obtenerVIN(vin) {
  const res = await fetch("/api/querys/queryByVIN", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vin }),
  });

  if (!res.ok) throw new Error("Error consultando VIN");

  return await res.json();
}

export async function obtenerVINcarpointer(vin) {
  const res = await fetch("/api/carpointer/querybyvin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vin }),
  });

  if (!res.ok) throw new Error("Error consultando VIN");

  return await res.json();
}

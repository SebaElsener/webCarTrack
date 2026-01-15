export function addDatosSheet(wb, datos) {
  const ws = wb.getWorksheet("Datos");
  if (!ws) throw new Error("La hoja 'Datos' no existe en la plantilla");

  // limpiar filas (mantiene headers y la tabla)
  ws.spliceRows(2, ws.rowCount);

  datos.forEach((d) => {
    ws.addRow([
      new Date(d.fecha),
      d.marca ?? "",
      d.modelo ?? "",
      d.vin ?? "",
      d.areas ?? "",
      d.averias ?? "",
    ]);
  });
}

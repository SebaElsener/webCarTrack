import ExcelJS from "exceljs";
import path from "path";

export async function generarExcelReporte(payload) {
  const templatePath = path.resolve(
    "templates/Plantilla_Reporte_Pro_final.xlsx"
  );
  const outputPath = path.resolve("exports/reporte_danios.xlsx");

  const workbook = new ExcelJS.Workbook();

  // 🚨 NO ignoreNodes
  await workbook.xlsx.readFile(templatePath);

  const wsDatos = workbook.getWorksheet("Datos");

  // limpiar filas (dejamos headers)
  wsDatos.spliceRows(2, wsDatos.rowCount);

  const rows = normalizeDatos(payload.datos);

  rows.forEach((r) => {
    wsDatos.addRow([r.fecha, r.marca, r.modelo, r.vin, r.areas, r.averias]);
  });

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
}

function normalizeDatos(datosRaw) {
  const rows = [];

  datosRaw.forEach((item) => {
    const areas = Array.isArray(item.areas) ? item.areas : [];
    const averias = Array.isArray(item.averias) ? item.averias : [];

    const count = Math.min(areas.length, averias.length);

    for (let i = 0; i < count; i++) {
      rows.push({
        fecha: item.fecha,
        marca: item.marca,
        modelo: item.modelo,
        vin: item.vin,
        areas: areas[i],
        averias: averias[i],
      });
    }
  });

  return rows;
}

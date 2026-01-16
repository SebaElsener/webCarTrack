import path from "path";
import { execFile } from "child_process";

let fileNameEnding = "";

const excelHelper = async (datos) => {
  const ahora = new Date();
  const año = ahora.getFullYear();
  const mes = (ahora.getMonth() + 1).toString().padStart(2, "0"); // Meses son 0-11, +1 y padStart
  const dia = ahora.getDate().toString().padStart(2, "0");
  const horas = ahora.getHours().toString().padStart(2, "0");
  const minutos = ahora.getMinutes().toString().padStart(2, "0");
  const segundos = ahora.getSeconds().toString().padStart(2, "0");

  fileNameEnding = `${año}-${mes}-${dia}-${horas}${minutos}${segundos}`;

  const scriptPath = path.resolve("./src/python/export_report.py");
  const outputPath = path.resolve(
    `./exports/reporte_danios_${fileNameEnding}.xlsx`
  );
  execFile(
    "python3",
    [scriptPath, outputPath, JSON.stringify(datos)],
    (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return res.status(500).json({ error: "Error generando Excel" });
      }
      console.log(stdout);
    }
  );
  return outputPath;
};

export async function generarReportesExcel(req, res) {
  const outputPath = await excelHelper(req.body);

  res.download(outputPath);
}

export async function generarReportesPDF(req, res) {
  await excelHelper(req.body);

  const excelPath = path.resolve(
    `./exports/reporte_danios_${fileNameEnding}.xlsx`
  );

  execFile(
    "python3",
    ["src/python/export_pdf.py", excelPath],
    (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return;
      }
      console.log(stdout);
      res.download(
        path.resolve(`./exports/reporte_danios_${fileNameEnding}.pdf`)
      );
    }
  );
}

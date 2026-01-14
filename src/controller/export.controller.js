import path from "path";
import { execFile } from "child_process";

export async function generarReportesExcel(req, res) {
  const scriptPath = path.resolve("./src/python/export_report.py");
  const outputPath = path.resolve("./exports/reporte_danios.xlsx");

  const datos = req.body;
  execFile(
    "python3",
    [scriptPath, outputPath, JSON.stringify(datos)],
    (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return res.status(500).json({ error: "Error generando Excel" });
      }
      console.log(stdout);
      res.download(outputPath);
    }
  );
}

export async function generarReportesPDF(req, res) {
  const scriptPath = path.resolve("./src/python/export_pdf.py");
  const outputPath = path.resolve("./exports/reporte_danios.pdf");

  const datos = req.body;
  execFile(
    "python3",
    [scriptPath, outputPath, JSON.stringify(datos)],
    (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return res.status(500).json({ error: "Error generando PDF" });
      }
      console.log(stdout);
      res.download(outputPath);
    }
  );
}

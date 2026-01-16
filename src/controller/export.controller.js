import path from "path";
import fs from "fs";
import { execFile } from "child_process";

let fileNameEnding;
let fileName;
let fileNamePDF;
let PDFoutputPath;

const excelHelper = async (datos) => {
  return new Promise((resolve, reject) => {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, "0"); // Meses son 0-11, +1 y padStart
    const dia = ahora.getDate().toString().padStart(2, "0");
    const horas = ahora.getHours().toString().padStart(2, "0");
    const minutos = ahora.getMinutes().toString().padStart(2, "0");
    const segundos = ahora.getSeconds().toString().padStart(2, "0");

    fileNameEnding = `${año}-${mes}-${dia}-${horas}${minutos}${segundos}`;
    fileName = `reporte_danios_${fileNameEnding}.xlsx`;
    fileNamePDF = `reporte_danios_${fileNameEnding}.pdf`;

    const scriptPath = path.resolve("./src/python/export_report.py");
    const outputPath = path.resolve("exports", fileName);
    PDFoutputPath = path.resolve("exports", fileNamePDF);

    execFile(
      "python3",
      [scriptPath, outputPath, JSON.stringify(datos)],
      (err, stdout, stderr) => {
        if (err) {
          console.error("STDERR: ", stderr);
          return res.status(500).json({ error: "Error generando Excel" });
        }
        console.log(stdout);
        resolve(outputPath, PDFoutputPath);
      }
    );
  });
};

export async function generarReportesExcel(req, res) {
  try {
    const excelPath = await excelHelper(req.body);

    if (!fs.existsSync(excelPath)) {
      return res
        .status(500)
        .json({ error: "El archivo excel no se generó correctamente" });
    }
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.sendFile(excelPath);
  } catch (error) {
    console.error("Error en generarReportesExcel:", error);
    res.status(500).json({ error: "Error generando el reporte Excel" });
  }
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
      console.log(fileNamePDF, "///", PDFoutputPath);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileNamePDF}"`
      );

      res.setHeader("Content-Type", "application/pdf");

      res.sendFile(PDFoutputPath);
    }
  );
}

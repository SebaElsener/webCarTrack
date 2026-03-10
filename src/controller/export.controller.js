import path from "path";
import fs from "fs";
import { execFile } from "child_process";

const PYTHON_BIN = process.env.PYTHON_BIN || "python3";

const excelHelper = async (datos) => {
  return new Promise((resolve, reject) => {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, "0"); // Meses son 0-11, +1 y padStart
    const dia = ahora.getDate().toString().padStart(2, "0");
    const horas = ahora.getHours().toString().padStart(2, "0");
    const minutos = ahora.getMinutes().toString().padStart(2, "0");
    const segundos = ahora.getSeconds().toString().padStart(2, "0");

    const fileNameEnding = `${año}-${mes}-${dia}-${horas}${minutos}${segundos}`;
    const fileName = `reporte_danios_${fileNameEnding}.xlsx`;
    const fileNamePDF = `reporte_danios_${fileNameEnding}.pdf`;

    const scriptPath = path.resolve("./src/python/export_report.py");
    const outputPath = path.resolve("exports", fileName);
    const PDFoutputPath = path.resolve("exports", fileNamePDF);

    execFile(
      PYTHON_BIN,
      [scriptPath, outputPath, JSON.stringify(datos)],
      (err, stdout, stderr) => {
        if (err) {
          console.error("STDERR: ", stderr);
          return { error: "Error generando Excel" };
        }
        console.log(stdout);
        resolve({ outputPath, PDFoutputPath, fileName, fileNamePDF });
      },
    );
  });
};

export async function generarReportesExcel(req, res) {
  try {
    const { outputPath, fileName } = await excelHelper(req.body);

    if (!fs.existsSync(outputPath)) {
      return res
        .status(500)
        .json({ error: "El archivo excel no se generó correctamente" });
    }
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.sendFile(outputPath);
  } catch (error) {
    console.error("Error en generarReportesExcel:", error);
    res.status(500).json({ error: "Error generando el reporte Excel" });
  }
}

export async function generarReportesPDF(req, res) {
  try {
    const { outputPath, PDFoutputPath, fileNamePDF } = await excelHelper(
      req.body,
    );
    console.log(PDFoutputPath, "///", fileNamePDF);

    execFile(
      PYTHON_BIN,
      ["src/python/export_pdf.py", outputPath],
      (err, stdout, stderr) => {
        if (err) {
          console.error("STDERR:", stderr);
          return res.status(500).json({ error: "Error generando el PDF" });
        }

        console.log(stdout);

        if (!fs.existsSync(PDFoutputPath)) {
          return res.status(500).json({ error: "El archivo PDF no se generó" });
        }

        // 🔑 CLAVE para fetch
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileNamePDF}"`,
        );

        res.setHeader("Content-Type", "application/pdf");

        res.sendFile(PDFoutputPath);
      },
    );
  } catch (error) {
    console.error("Error en generarReportesPDF:", error);
    res.status(500).json({ error: "Error generando el reporte PDF" });
  }
}

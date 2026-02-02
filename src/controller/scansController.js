import { getAllScans, deleteScan } from "../business/scansBusiness.js";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";

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
    const fileName = `cartaporte_${fileNameEnding}.xlsx`;
    const fileNamePDF = `cartaporte_${fileNameEnding}.pdf`;

    const scriptPath = path.resolve("./src/python/cartaporte.py");
    const templatePath = path.resolve("templates/plantilla_carta_porte.xlsx");
    const outputPath = path.resolve("exports", fileName);
    const PDFoutputPath = path.resolve("exports", fileNamePDF);

    execFile(
      "python3",
      [scriptPath, templatePath, outputPath, JSON.stringify(datos)],
      (err, stdout, stderr) => {
        if (err) {
          console.error("STDERR: ", stderr);
          return { error: "Error generando Excel cartaporte" };
        }
        console.log(stdout);
        resolve({ outputPath, PDFoutputPath, fileName, fileNamePDF });
      },
    );
  });
};

const renderScans = async (req, res) => {
  const scansData = await getAllScans();
  res.render("scansData", {
    scansData: scansData,
  });
};

const deletebyscan_id = async (req, res) => {
  const { scan_id } = req.params;
  const result = await deleteScan(scan_id);
  return res.status(200).json(result);
};

const cartaporteController = async (req, res) => {
  try {
    const { outputPath, PDFoutputPath, fileNamePDF } = await excelHelper(
      req.body,
    );

    execFile(
      "python3",
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
    console.error("Error generando carta de porte", error);
    return res.status(500).json({
      error: "No se pudo generar la carta de porte",
    });
  }
};

export { renderScans, deletebyscan_id, cartaporteController };

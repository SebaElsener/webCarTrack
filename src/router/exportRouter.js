import { Router as router } from "express";
import {
  generarReportesExcel,
  generarReportesPDF,
} from "../controller/export.controller.js";

const exportRouter = new router();

// devuelve todos los productos del carrito según id
exportRouter.post("/reportesExcel", generarReportesExcel);

exportRouter.post("/reportesPDF", generarReportesPDF);

export default exportRouter;

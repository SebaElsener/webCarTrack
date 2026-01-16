import { Router as router } from "express";
import {
  generarReportesExcel,
  generarReportesPDF,
} from "../controller/export.controller.js";

const exportRouter = new router();

exportRouter.post("/reportesExcel", generarReportesExcel);

exportRouter.post("/reportesPDF", generarReportesPDF);

export default exportRouter;

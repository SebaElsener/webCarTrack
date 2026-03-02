import { Router } from "express";

import {
  renderScans,
  deletebyscan_id,
  cartaporteController,
  newVINController,
} from "../controller/scansController.js";

const scansRoute = new Router();

scansRoute.get("/", renderScans);
scansRoute.delete("/deletebyscan_id/:scan_id", deletebyscan_id);
scansRoute.post("/cartaporte/:scanId", cartaporteController);
scansRoute.post("/create-new-vin", newVINController);

export default scansRoute;

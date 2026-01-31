import { Router } from "express";

import { renderScans, deletebyscan_id } from "../controller/scansController.js";

const scansRoute = new Router();

scansRoute.get("/", renderScans);
scansRoute.delete("/deletebyscan_id/:scan_id", deletebyscan_id);

export default scansRoute;

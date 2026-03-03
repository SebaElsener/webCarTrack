import { Router } from "express";

import {
  updateDamagesController,
  patchScanController,
} from "../controller/updateDamagesController.js";

const updatesRouter = new Router();

updatesRouter.post("/damages", updateDamagesController);
updatesRouter.patch("/:scanId", patchScanController);

export default updatesRouter;

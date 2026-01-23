import { Router } from "express";

import { deleteDamagesController } from "../controller/deleteDamagesController.js";

const damagesRouter = new Router();

damagesRouter.delete("/deletedamages/:vin", deleteDamagesController);

export default damagesRouter;

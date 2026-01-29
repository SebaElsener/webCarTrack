import { Router } from "express";

import { deleteDamagesController } from "../controller/deleteDamagesController.js";

const damagesRouter = new Router();

damagesRouter.delete("/deletedamages/:damageId", deleteDamagesController);

export default damagesRouter;

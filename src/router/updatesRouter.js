import { Router } from "express";

import { updateDamagesController } from "../controller/updateDamagesController.js";

const updatesRouter = new Router();

updatesRouter.post("/damages", updateDamagesController);

export default updatesRouter;

import { Router as router } from "express";
import { carpointerQueryRender } from "../controller/carpointerController.js";

const carpointerRouter = new router();

carpointerRouter.get("/query", carpointerQueryRender);

export default carpointerRouter;

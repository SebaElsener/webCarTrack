import { Router as router } from "express";
import {
  carpointerQueryRender,
  carpointerQuerybydate,
} from "../controller/carpointerController.js";

const carpointerRouter = new router();

carpointerRouter.get("/query", carpointerQueryRender);
carpointerRouter.post("/querybydate", carpointerQuerybydate);

export default carpointerRouter;

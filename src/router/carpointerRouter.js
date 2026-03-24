import { Router as router } from "express";
import {
  carpointerQueryRender,
  carpointerQuerybydate,
  getDataByVINfromCarpointerController,
} from "../controller/carpointerController.js";

const carpointerRouter = new router();

carpointerRouter.get("/query", carpointerQueryRender);
carpointerRouter.post("/querybydate", carpointerQuerybydate);
carpointerRouter.post("/querybyvin", getDataByVINfromCarpointerController);

export default carpointerRouter;

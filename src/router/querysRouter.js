import { Router as router } from "express";
import {
  queryByDateRender,
  queryByDatePost,
  queryByVINPost,
  queryByVINRender,
} from "../controller/querysController.js";

const querysRouter = new router();

querysRouter.get("/queryByDate", queryByDateRender);
querysRouter.post("/queryByDate", queryByDatePost);
querysRouter.get("/queryByVIN", queryByVINRender);
querysRouter.post("/queryByVIN", queryByVINPost);

export default querysRouter;

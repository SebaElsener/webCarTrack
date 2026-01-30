import { Router as router } from "express";
import {
  deletePhotoController,
  deletePhotoSetController,
} from "../controller/photosController.js";

const photosRouter = new router();

photosRouter.delete("/delete", deletePhotoController);
photosRouter.delete("/delete-all", deletePhotoSetController);

export default photosRouter;

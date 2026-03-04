import { Router as router } from "express";
import multer from "multer";
import {
  deleteFileController,
  deleteFileSetController,
  uploadFiles,
} from "../controller/photosController.js";

const photosRouter = new router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // opcional 10MB
});

photosRouter.delete("/delete", deleteFileController);
photosRouter.delete("/delete-all", deleteFileSetController);
photosRouter.post("/upload-files", upload.single("file"), uploadFiles);

export default photosRouter;

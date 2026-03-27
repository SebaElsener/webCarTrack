import { Router as router } from "express";
import multer from "multer";
import {
  uploadMovimientos,
  uploadProgress,
} from "../controller/uploadsController.js";

const uploadsRouter = new router();
const upload = multer({ dest: "uploads/" });

uploadsRouter.get("/progress/:jobId", uploadProgress);
uploadsRouter.post(
  "/upload-movimientos",
  upload.single("file"),
  uploadMovimientos,
);

export default uploadsRouter;

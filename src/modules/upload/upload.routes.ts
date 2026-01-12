import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import uploadController from "./upload.controller";

const uploadRouter = express.Router();

// (1) Frontend → Backend (presigned url 요청)
// (2) Backend → presigned url 생성 및 반환
// (3) Frontend → presigned url로 S3에 직접 파일 업로드
uploadRouter.post(
  "/presigned-url",
  authMiddleware,
  uploadController.postPresignedUrl
);

// (1) Frontend → Backend (view presigned url 요청)
// (2) Backend → view presigned url 생성 및 반환 (매번 새로 생성 & 만료 시간 1시간)
uploadRouter.get(
  "/presigned-url",
  authMiddleware,
  uploadController.getPresignedUrl
);

// (1) Frontend → Backend (delete presigned url 요청)
// (2) Backend → delete presigned url 생성 및 반환 (만료 시간 1시간)
// (3) Frontend → presigned url로 S3에 직접 파일 삭제
uploadRouter.delete(
  "/presigned-url",
  authMiddleware,
  uploadController.deletePresignedUrl
);

export default uploadRouter;

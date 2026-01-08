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
// 일반적으로는 다른 api에서 presigned-url 생성하는 로직을 함께 처리할 수도 있음

export default uploadRouter;

import express from "express";
import reviewController from "./review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const reviewRouter = express.Router();

// 리뷰 리스트 조회
reviewRouter.get("/", authMiddleware, reviewController.list);

// 내가 작성한 리뷰 조회
reviewRouter.get("/my", authMiddleware, reviewController.listMine);

// 작성 가능한 리뷰 조회
reviewRouter.get("/writable", authMiddleware, reviewController.listWritable);

export default reviewRouter;

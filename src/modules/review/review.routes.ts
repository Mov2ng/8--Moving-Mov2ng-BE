import express from "express";
import reviewController from "./review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { userOnlyMiddleware } from "../../middlewares/role.middleware";
import validate from "../../middlewares/validate.middleware";
import { createReviewSchema } from "../../validators/review.validator";

const reviewRouter = express.Router();

// 리뷰 리스트 조회
reviewRouter.get(
  "/",
  authMiddleware,
  userOnlyMiddleware,
  reviewController.list
);

// 리뷰 작성
reviewRouter.post(
  "/",
  authMiddleware,
  userOnlyMiddleware,
  validate(createReviewSchema),
  reviewController.create
);

// 내가 작성한 리뷰 조회
reviewRouter.get(
  "/my",
  authMiddleware,
  userOnlyMiddleware,
  reviewController.listMine
);

// 작성 가능한 리뷰 조회
reviewRouter.get(
  "/writable",
  authMiddleware,
  userOnlyMiddleware,
  reviewController.listWritable
);

export default reviewRouter;

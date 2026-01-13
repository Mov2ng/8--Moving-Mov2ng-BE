import express from "express";
import estimateController from "./estimate.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import { PostEstimateRequestSchema } from "./estimate.dto";
import { activeEstimateMiddleware, checkRequest5DriverMiddleware } from "../../middlewares/estimate.middleware";
import { userOnlyMiddleware } from "../../middlewares/role.middleware";

const estimateRouter = express.Router();

// 견적 요청
estimateRouter.post(
  "/",
  authMiddleware,
  activeEstimateMiddleware,
  userOnlyMiddleware,
  validate(PostEstimateRequestSchema),
  estimateController.postEstimate
);

// 지정 견적 요청
estimateRouter.post(
  "/:id/estimate",
  authMiddleware, 
  userOnlyMiddleware,
  checkRequest5DriverMiddleware,
  estimateController.requestEstimate
);

export default estimateRouter;

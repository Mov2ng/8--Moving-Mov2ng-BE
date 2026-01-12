import express from "express";
import estimateController from "./estimate.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import { PostEstimateRequestSchema } from "./estimate.dto";
import { activeEstimateMiddleware, checkRequest5DriverMiddleware } from "../../middlewares/estimate.middleware";

const estimateRouter = express.Router();

estimateRouter.post(
  "/",
  authMiddleware,
  activeEstimateMiddleware,
  validate(PostEstimateRequestSchema),
  estimateController.postEstimate
);

estimateRouter.post(
  "/:id/estimate",
  authMiddleware, 
  checkRequest5DriverMiddleware,
  estimateController.requestEstimate
);

export default estimateRouter;

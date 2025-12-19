import express from "express";
import estimateController from "./estimate.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import { PostEstimateSchema } from "./estimate.dto";
import { activeEstimateMiddleware } from "../../middlewares/estimate.middleware";

const estimateRouter = express.Router();

estimateRouter.post("/", authMiddleware, activeEstimateMiddleware, estimateController.postEstimate);

export default estimateRouter;
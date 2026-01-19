import { Router } from "express";
import validate from "../../../middlewares/validate.middleware";
import requestDriverController from "./request.driver.controller";
import {
  driverRequestListDto,
  driverDesignatedRequestListDto,
  driverEstimateAcceptDto,
  driverEstimateRejectDto,
  driverEstimateUpdateDto,
  driverRequestDeleteDto,
  driverRejectedEstimateListDto,
} from "../../../validators/request.driver.validation";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { driverOnlyMiddleware } from "../../../middlewares/role.middleware";

const router = Router();

router.get(
  "/list",
  validate(driverRequestListDto),
  authMiddleware,
  driverOnlyMiddleware,
  requestDriverController.getDriverRequests
);

router.get(
  "/estimate/list",
  validate(driverDesignatedRequestListDto),
  authMiddleware,
  driverOnlyMiddleware,
  requestDriverController.getDriverDesignatedRequests
);

router.post(
  "/estimate/accept",
  validate(driverEstimateAcceptDto),
  authMiddleware,
  driverOnlyMiddleware,
  requestDriverController.acceptEstimate
);

router.post(
  "/estimate/reject",
  validate(driverEstimateRejectDto),
  authMiddleware,
  driverOnlyMiddleware,
  requestDriverController.rejectEstimate
);

router.post(
  "/estimate/update",
  validate(driverEstimateUpdateDto),
  authMiddleware,
  driverOnlyMiddleware,
  requestDriverController.updateEstimateDecision
);

router.get(
  "/estimate/rejected",
  validate(driverRejectedEstimateListDto),
  authMiddleware,
  driverOnlyMiddleware,
  requestDriverController.getRejectedEstimates
);

router.delete(
  "/request",
  validate(driverRequestDeleteDto),
  authMiddleware,
  driverOnlyMiddleware,
  requestDriverController.deleteDriverRequest
);

export default router;

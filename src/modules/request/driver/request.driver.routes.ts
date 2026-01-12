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

const router = Router();

router.get(
  "/requests/driver/list",
  validate(driverRequestListDto),
  authMiddleware,
  requestDriverController.getDriverRequests
);

router.get(
  "/requests/driver/estimate/list",
  validate(driverDesignatedRequestListDto),
  authMiddleware,
  requestDriverController.getDriverDesignatedRequests
);

router.post(
  "/requests/driver/estimate/accept",
  validate(driverEstimateAcceptDto),
  authMiddleware,
  requestDriverController.acceptEstimate
);

router.post(
  "/requests/driver/estimate/reject",
  validate(driverEstimateRejectDto),
  authMiddleware,
  requestDriverController.rejectEstimate
);

router.post(
  "/requests/driver/estimate/update",
  validate(driverEstimateUpdateDto),
  authMiddleware,
  requestDriverController.updateEstimateDecision
);

router.get(
  "/requests/driver/estimate/rejected",
  validate(driverRejectedEstimateListDto),
  authMiddleware,
  requestDriverController.getRejectedEstimates
);

router.delete(
  "/requests/driver/request",
  validate(driverRequestDeleteDto),
  authMiddleware,
  requestDriverController.deleteDriverRequest
);

export default router;

import { Router } from "express";
import validate from "../../../middlewares/validate.middleware";
import requestDriverController from "./request.driver.controller";
import {
  driverRequestListDto,
  driverDesignatedRequestListDto,
  driverEstimateAcceptDto,
  driverEstimateRejectDto,
  driverRejectedEstimateListDto,
} from "../../../validators/request.driver.validation";

const router = Router();

router.get(
  "/requests/driver/list",
  validate(driverRequestListDto),
  requestDriverController.getDriverRequests
);

router.get(
  "/requests/driver/estimate/list",
  validate(driverDesignatedRequestListDto),
  requestDriverController.getDriverDesignatedRequests
);

router.post(
  "/requests/driver/estimate/accept",
  validate(driverEstimateAcceptDto),
  requestDriverController.acceptEstimate
);

router.post(
  "/requests/driver/estimate/reject",
  validate(driverEstimateRejectDto),
  requestDriverController.rejectEstimate
);

router.get(
  "/requests/driver/estimate/rejected",
  validate(driverRejectedEstimateListDto),
  requestDriverController.getRejectedEstimates
);

export default router;

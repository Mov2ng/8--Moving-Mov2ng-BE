import { Router } from "express";
import authMiddleware from "../../../middlewares/auth.middleware";
import validate from "../../../middlewares/validate.middleware";
import requestDriverController from "./request.driver.controller";
import {
  driverRequestListSchema,
  driverDesignatedRequestListSchema,
} from "./request.driver.validation";

const router = Router();

router.get(
  "/requests/driver/list",
  authMiddleware,
  validate(driverRequestListSchema),
  requestDriverController.getDriverRequests
);

router.get(
  "/requests/driver/estimate/list",
  authMiddleware,
  validate(driverDesignatedRequestListSchema),
  requestDriverController.getDriverDesignatedRequests
);

export default router;

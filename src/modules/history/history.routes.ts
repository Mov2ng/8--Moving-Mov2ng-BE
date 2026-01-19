import { Router } from "express";
import validate from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import historyController from "./history.controller";
import {
  historyDetailDto,
  historyListDto,
} from "../../validators/history.validation";

const router = Router();

router.get(
  "/",
  validate(historyListDto),
  authMiddleware,
  historyController.getHistoryList
);

router.get(
  "/:id",
  validate(historyDetailDto),
  authMiddleware,
  historyController.getHistoryDetail
);

export default router;

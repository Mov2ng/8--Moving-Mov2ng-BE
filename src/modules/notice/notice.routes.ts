import { Router } from "express";
import validate from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import noticeController from "./notice.controller";
import {
  noticeListDto,
  noticeReadAllDto,
  noticeReadDto,
} from "../../validators/notice.validation";

const router = Router();

router.get(
  "/user",
  validate(noticeListDto),
  authMiddleware,
  noticeController.getUserNotices
);

router.get(
  "/driver",
  validate(noticeListDto),
  authMiddleware,
  noticeController.getDriverNotices
);

router.post(
  "/read/:id",
  validate(noticeReadDto),
  authMiddleware,
  noticeController.markNoticeRead
);

router.post(
  "/read/all/:id",
  validate(noticeReadAllDto),
  authMiddleware,
  noticeController.markAllNoticesRead
);

export default router;

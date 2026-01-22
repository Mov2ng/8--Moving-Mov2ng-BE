import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { userOnlyMiddleware } from "../../../middlewares/role.middleware";
import requestUserController from "./request.user.controller";

const requestUserRouter = express.Router();

// 내가 요청한 견적 목록 조회
requestUserRouter.get(
  "/requests",
  authMiddleware,
  userOnlyMiddleware,
  requestUserController.getUserRequests
);

// 받은 견적 목록 조회
requestUserRouter.get(
  "/estimates",
  authMiddleware,
  userOnlyMiddleware,
  requestUserController.getReceivedQuotes
);

// 대기중인 견적 상세 조회
requestUserRouter.get(
  "/estimates/:estimateId/pending",
  authMiddleware,
  userOnlyMiddleware,
  requestUserController.getPendingQuoteDetail
);

// 받은 견적 상세 조회 (상태 무관)
requestUserRouter.get(
  "/estimates/:estimateId",
  authMiddleware,
  userOnlyMiddleware,
  requestUserController.getQuoteDetail
);

// 견적 확정
requestUserRouter.post(
  "/estimates/:estimateId/pending/accept",
  authMiddleware,
  userOnlyMiddleware,
  requestUserController.acceptQuote
);

export default requestUserRouter;

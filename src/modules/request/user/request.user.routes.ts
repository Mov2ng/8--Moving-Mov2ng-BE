import express from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import requestUserController from "./request.user.controller";

const requestUserRouter = express.Router();

// 받은 견적 목록 조회
requestUserRouter.get(
  "/quotes",
  authMiddleware,
  requestUserController.getReceivedQuotes
);

// 대기중인 견적 상세 조회
requestUserRouter.get(
  "/quotes/pending/:estimateId",
  authMiddleware,
  requestUserController.getPendingQuoteDetail
);

// 견적 확정
requestUserRouter.post(
  "/quotes/pending/:estimateId/accept",
  authMiddleware,
  requestUserController.acceptQuote
);

export default requestUserRouter;

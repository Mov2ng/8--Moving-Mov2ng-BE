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

export default requestUserRouter;

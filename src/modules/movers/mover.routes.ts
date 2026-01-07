import express, { RequestHandler } from "express";
import moverController from "./mover.controller";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import { MoverListQuerySchema } from "./mover.dto";

const moverRouter = express.Router();

// 기사님 목록 조회 - 로그인 선택 (로그인 시 isFavorite 확인 가능)
moverRouter.get(
  "/",
  optionalAuthMiddleware,
  validate(MoverListQuerySchema),
  moverController.getMovers
);
// 기사님 상세 조회 - 전체 데이터 - 로그인 선택
moverRouter.get(
  "/:id/full",
  optionalAuthMiddleware,
  moverController.getMoverDetailFull
);
// 기사님 상세 조회 - 추가 데이터만
moverRouter.get("/:id/extra", moverController.getMoverDetailExtra);

// 기사님 즐겨찾기 생성 - 로그인 필수
moverRouter.post(
  "/:id/favorite",
  authMiddleware,
  moverController.createMoverFavorite
);
// 기사님 즐겨찾기 삭제 - 로그인 필수
moverRouter.delete(
  "/:id/favorite",
  authMiddleware,
  moverController.deleteMoverFavorite
);
// 즐겨찾기한 기사 목록 조회
moverRouter.get(
  "/favorites",
  authMiddleware,
  moverController.getFavoriteDrivers
);

export default moverRouter;

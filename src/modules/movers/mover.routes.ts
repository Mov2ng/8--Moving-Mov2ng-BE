import express, { RequestHandler } from "express";
import moverController from "./mover.controller";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../../middlewares/auth.middleware";
import validate from "../../middlewares/validate.middleware";
import { MoverListQuerySchema } from "./mover.dto";
import { driverOnlyMiddleware } from "../../middlewares/role.middleware";

const moverRouter = express.Router();

// 기사님 목록 조회 - 로그인 선택 (로그인 시 isFavorite 확인 가능)
moverRouter.get(
  "/",
  optionalAuthMiddleware,
  validate(MoverListQuerySchema),
  moverController.getMovers
);
// 기사님 본인 정보 조회 (마이페이지용) - 로그인 필수
moverRouter.get(
  "/me",
  authMiddleware,
  driverOnlyMiddleware,
  moverController.getMyMoverDetail
);
// 즐겨찾기한 기사 목록 조회 - 로그인 필수
moverRouter.get(
  "/favorites",
  authMiddleware,
  moverController.getFavoriteDrivers
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

export default moverRouter;

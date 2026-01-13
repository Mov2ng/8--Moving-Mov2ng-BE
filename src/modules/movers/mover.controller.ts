import { asyncWrapper } from "../../utils/asyncWrapper";
import ApiResponse from "../../core/http/ApiResponse";
import moverService from "./mover.service";

import type { Request, Response } from "express";
import type { MoverListQueryDTO } from "./mover.dto";

// 기사님 목록 조회
const getMovers = asyncWrapper(
  async (req: Request<{}, {}, {}, MoverListQueryDTO>, res: Response) => {
    const { keyword, region, service, sort } = req.query;
    const userId = req.user?.id ?? undefined;

    // query string은 항상 문자열이므로 숫자로 변환
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const movers = await moverService.getMovers(
      { keyword, region, service, sort, cursor, limit },
      userId
    );
    return ApiResponse.success(res, movers, "기사님 목록 조회 성공");
  }
);

// 기사님 상세 조회 - 전체 데이터
const getMoverDetailFull = asyncWrapper(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id ?? undefined;

    console.log(userId);
    const mover = await moverService.getMoverDetailFull(Number(id), userId);
    return ApiResponse.success(res, mover, "기사님 상세 조회 성공");
  }
);

// 기사님 상세 조회 - 추가 데이터만
const getMoverDetailExtra = asyncWrapper(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const mover = await moverService.getMoverDetailExtra(Number(id));
    return ApiResponse.success(res, mover, "기사님 상세 조회 성공");
  }
);

// 기사님 즐겨찾기 생성
const createMoverFavorite = asyncWrapper(
  async (req: Request<{ id: string }>, res: Response) => {
    const driverId = req.params.id;
    const userId = req.user?.id as string;

    const mover = await moverService.createMoverFavorite(
      Number(driverId),
      userId
    );
    return ApiResponse.success(res, mover, "기사님 즐겨찾기 생성 성공");
  }
);

// 기사님 즐겨찾기 삭제
const deleteMoverFavorite = asyncWrapper(
  async (req: Request<{ id: string }>, res: Response) => {
    const driverId = req.params.id;
    const userId = req.user?.id as string;

    const mover = await moverService.deleteMoverFavorite(
      Number(driverId),
      userId
    );
    return ApiResponse.success(res, mover, "기사님 즐겨찾기 삭제 성공");
  }
);

// 즐겨찾기한 기사 목록 조회
const getFavoriteDrivers = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const favorites = await moverService.getFavoriteDrivers(userId);
  return ApiResponse.success(res, favorites, "찜한 기사님 조회 성공");
});

// 기사님 본인 정보 조회 (마이페이지용)
const getMyMoverDetail = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user!.id; // authMiddleware로 인증됨
  const mover = await moverService.getMyMoverDetail(userId); 
  return ApiResponse.success(res, mover, "내 정보 조회 성공");
});

export default {
  getMovers,
  getMoverDetailFull,
  getMoverDetailExtra,
  getMyMoverDetail,
  createMoverFavorite,
  deleteMoverFavorite,
  getFavoriteDrivers,
};

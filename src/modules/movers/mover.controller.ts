import { Request, Response } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { MoverListQueryDTO } from "./mover.dto";
import ApiResponse from "../../core/http/ApiResponse";
import moverService from "./mover.service";

// 기사님 목록 조회
const getMovers = asyncWrapper(
  async (req: Request<{}, {}, {}, MoverListQueryDTO>, res: Response) => {
    const { keyword, region, service, sort, cursor, limit = 20 } = req.query;
    const userId = req.user?.id ?? undefined;

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
export default {
  getMovers,
  getMoverDetailFull,
  getMoverDetailExtra,
  createMoverFavorite,
  deleteMoverFavorite,
};

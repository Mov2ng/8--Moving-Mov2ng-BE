import { Request, Response } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { MoverListQueryDTO } from "./mover.dto";
import ApiResponse from "../../core/http/ApiResponse";
import moverService from "./mover.service";

const getMovers = asyncWrapper(
  async (req: Request<{}, {}, {}, MoverListQueryDTO>, res: Response) => {
  const movers = await moverService.getMovers();
  return ApiResponse.success(res, movers, "기사님 목록 조회 성공");
});

export default {
  getMovers,
};

import { asyncWrapper } from "../../utils/asyncWrapper";
import ApiResponse from "../../core/http/ApiResponse";
import estimateService from "./estimate.service";

import type { Request, Response } from "express";
import { PostEstimateSchema, type PostEstimateDTO } from "./estimate.dto";

const postEstimate = asyncWrapper(
  async (req: Request<{}, {}, PostEstimateDTO>, res: Response) => {
    // const estimate = req.body;
    const estimate = PostEstimateSchema.parse(req.body); // zod로 파싱하여 movingDate string → Date 변환 임시 처리

    const userId = req.user?.id ?? "";

    const newEstimate = await estimateService.postEstimate(estimate, userId);
    return ApiResponse.success(res, newEstimate, "견적 생성 성공");
  }
);

const requestEstimate = asyncWrapper(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params; // 기사님 ID
    const userId = req.user?.id ?? ""; // 사용자 ID

    const request = await estimateService.requestEstimate(Number(id), userId);
    return ApiResponse.success(res, request, "기사님 지정 견적 요청 성공");
  }
);

export default {
  postEstimate,
  requestEstimate,
};

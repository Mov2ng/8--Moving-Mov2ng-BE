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

export default {
  postEstimate,
};

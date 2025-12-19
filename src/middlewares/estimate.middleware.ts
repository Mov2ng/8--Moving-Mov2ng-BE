import ApiError from "../core/http/ApiError";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../constants/http";
import estimateRepository from "../modules/estimate/estimate.repository";

import type { NextFunction, Request, Response } from "express";

// 현재 활성화된 견적이 있는지 확인하는 미들웨어
export async function activeEstimateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id ?? "";

    if (!userId) {
      return next(
        new ApiError(
          HTTP_STATUS.AUTH_REQUIRED,
          HTTP_MESSAGE.AUTH_REQUIRED,
          HTTP_CODE.AUTH_REQUIRED
        )
      );
    }

    const activeEstimate = await estimateRepository.getActiveEstimate(userId);

    if (activeEstimate) {
      return next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          HTTP_MESSAGE.ESTIMATE_ACTIVE,
          HTTP_CODE.ESTIMATE_ACTIVE
        )
      );
    }

    return next();
  } catch (error) {
    return next(
      new ApiError(
        HTTP_STATUS.INTERNAL_ERROR,
        HTTP_MESSAGE.INTERNAL_ERROR,
        HTTP_CODE.INTERNAL_ERROR
      )
    );
  }
}

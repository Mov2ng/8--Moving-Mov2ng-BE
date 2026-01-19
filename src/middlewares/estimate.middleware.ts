import ApiError from "../core/http/ApiError";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../constants/http";
import estimateRepository from "../modules/estimate/estimate.repository";

import type { NextFunction, Request, Response } from "express";
import moverRepository from "../modules/movers/mover.repository";

// 유저가 한 번만 기사님 지정 견적 요청 가능하도록 하는 미들웨어
export async function userOnlyOneDriverMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.id ?? "";
    const driverId = req.params.id;

    if (!driverId) {
      return next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          HTTP_MESSAGE.BAD_REQUEST,
          HTTP_CODE.BAD_REQUEST
        )
      );
    }

    const favoriteList = await moverRepository.getFavoriteDriversByUser(userId);

    if (
      favoriteList.some((favorite) => favorite.driver_id === Number(driverId))
    ) {
      return next(
        new ApiError(
          HTTP_STATUS.CONFLICT,
          HTTP_MESSAGE.DRIVER_ALREADY_FAVORITE,
          HTTP_CODE.DRIVER_ALREADY_FAVORITE
        )
      );
    }

    if (!userId) {
      return next(
        new ApiError(
          HTTP_STATUS.AUTH_REQUIRED,
          HTTP_MESSAGE.AUTH_REQUIRED,
          HTTP_CODE.AUTH_REQUIRED
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

    // 활성 견적 존재 확인
    const activeEstimate = await estimateRepository.getActiveEstimate(userId);

    if (activeEstimate) {
      // 활성 견적 존재 시 에러 반환
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

export async function checkRequest5DriverMiddleware(
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

    // 활성 견적 존재 확인
    const activeEstimate = await estimateRepository.getActiveEstimate(userId);

    if (!activeEstimate) {
      // 활성 견적 없을 시 에러 반환
      return next(
        new ApiError(
          HTTP_STATUS.NOT_FOUND,
          HTTP_MESSAGE.ESTIMATE_NOT_FOUND,
          HTTP_CODE.ESTIMATE_NOT_FOUND
        )
      );
    }

    // 기사님 지정 견적 요청 조회
    const specificEstimate = await estimateRepository.getSpecificEstimate(
      activeEstimate.id
    );

    if (specificEstimate.length > 5) {
      // 기사님 지정 견적 요청 5개 초과 시 에러 반환
      return next(
        new ApiError(
          HTTP_STATUS.CONFLICT,
          HTTP_MESSAGE.ESTIMATE_REQUEST_LIMIT,
          HTTP_CODE.ESTIMATE_REQUEST_LIMIT
        )
      );
    }

    const driverId = req.params.id;

    if (!driverId) {
      return next(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          HTTP_MESSAGE.BAD_REQUEST,
          HTTP_CODE.BAD_REQUEST
        )
      );
    }

    // 동일한 기사님 지정 견적 요청 존재 시 에러 발생
    const isDuplicate = specificEstimate.some(
      (estimate) => estimate.driver_id === Number(driverId)
    );

    if (isDuplicate) {
      return next(
        new ApiError(
          HTTP_STATUS.CONFLICT,
          HTTP_MESSAGE.ESTIMATE_REQUEST_EXISTS,
          HTTP_CODE.ESTIMATE_REQUEST_EXISTS
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

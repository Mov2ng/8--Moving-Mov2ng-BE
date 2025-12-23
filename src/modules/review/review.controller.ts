import { Request, Response } from "express";
import ApiResponse from "../../core/http/ApiResponse";
import { HTTP_STATUS } from "../../constants/http";
import { asyncWrapper } from "../../utils/asyncWrapper";
import reviewService from "./review.service";
import ApiError from "../../core/http/ApiError";
import { HTTP_CODE, HTTP_MESSAGE } from "../../constants/http";

const list = asyncWrapper(
  async (
    req: Request<{}, {}, {}, { driverId?: string; userId?: string }>,
    res: Response
  ) => {
    const driverIdParam = req.query.driverId;
    const userId = req.query.userId;

    let driverId: number | undefined;
    if (driverIdParam !== undefined) {
      driverId = Number(driverIdParam);
      if (Number.isNaN(driverId)) {
        return ApiResponse.success(
          res,
          [],
          "driverId는 숫자여야 합니다.",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const reviews = await reviewService.getReviews(driverId, userId);
    return ApiResponse.success(
      res,
      reviews,
      "리뷰 조회에 성공했습니다.",
      HTTP_STATUS.OK
    );
  }
);

const listWritable = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(
      HTTP_STATUS.AUTH_REQUIRED,
      HTTP_MESSAGE.AUTH_REQUIRED,
      HTTP_CODE.AUTH_REQUIRED
    );
  }

  const reviews = await reviewService.getWritableReviews(userId);
  return ApiResponse.success(
    res,
    reviews,
    "작성 가능한 리뷰 조회에 성공했습니다.",
    HTTP_STATUS.OK
  );
});

export default {
  list,
  listWritable,
};

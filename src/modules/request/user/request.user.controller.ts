import { Request, Response } from "express";
import ApiResponse from "../../../core/http/ApiResponse";
import { asyncWrapper } from "../../../utils/asyncWrapper";
import requestUserService from "./request.user.service";
import ApiError from "../../../core/http/ApiError";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../../constants/http";
import { EstimateStatus } from "../../../generated/prisma";

const getReceivedQuotes = asyncWrapper(
  async (
    req: Request<{}, {}, {}, { requestId?: string; status?: string }>,
    res: Response
  ) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }

    const requestIdParam = req.query.requestId;
    let requestId: number | undefined;

    if (requestIdParam !== undefined) {
      requestId = Number(requestIdParam);
      if (Number.isNaN(requestId)) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "requestId는 숫자여야 합니다.",
          HTTP_CODE.BAD_REQUEST
        );
      }
    }

    const statusParam = req.query.status;
    const status = (() => {
      switch (statusParam) {
        case "PENDING":
          return EstimateStatus.PENDING;
        case "ACCEPTED":
          return EstimateStatus.ACCEPTED;
        case "REJECTED":
          return EstimateStatus.REJECTED;
        default:
          return undefined;
      }
    })();

    const quotes = await requestUserService.getReceivedQuotes(
      userId,
      requestId,
      status
    );

    // 평균 별점, 리뷰/좋아요 수, 확정건수
    const enriched = quotes.map((quote) => {
      const reviews = quote.driver?.review ?? [];
      const reviewCount = quote.driver?._count?.review ?? 0;
      const likeCount = quote.driver?._count?.likes ?? 0;
      const confirmedCount = quote.driver?.estimates?.length ?? 0;

      const rating =
        reviews.length > 0
          ? reviews.reduce((sum: number, r) => sum + (r.rating ?? 0), 0) /
            reviews.length
          : 0;

      return {
        ...quote,
        driver: {
          ...quote.driver,
          rating,
          reviewCount,
          likeCount,
          confirmedCount,
        },
      };
    });

    return ApiResponse.success(
      res,
      enriched,
      "받은 견적 조회에 성공했습니다.",
      HTTP_STATUS.OK
    );
  }
);

export default {
  getReceivedQuotes,
};

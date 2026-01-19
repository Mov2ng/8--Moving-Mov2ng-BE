import { Request, Response } from "express";
import ApiResponse from "../../../core/http/ApiResponse";
import { asyncWrapper } from "../../../utils/asyncWrapper";
import requestUserService from "./request.user.service";
import ApiError from "../../../core/http/ApiError";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../../constants/http";
import { EstimateStatus } from "@prisma/client";

import type { QuoteWithDriver } from "./request.user.repository";
import type { QuoteDetailResponse } from "./request.user.dto";

const parseEstimateId = (raw: string | undefined) => {
  const id = Number(raw);
  if (Number.isNaN(id)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "estimateId는 숫자여야 합니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }
  return id;
};

function enrichQuote(
  quote: QuoteWithDriver,
  userId: string
): QuoteDetailResponse {
  const reviews = quote.driver?.review ?? [];
  const reviewCount = quote.driver?._count?.review ?? 0;
  const likeCount = quote.driver?._count?.likes ?? 0;
  const confirmedCount = quote.driver?.estimates?.length ?? 0;

  const rating =
    reviews.length > 0
      ? reviews.reduce(
          (sum: number, r: { rating?: number }) => sum + (r.rating ?? 0),
          0
        ) / reviews.length
      : 0;

  // 현재 사용자의 즐겨찾기 여부 확인
  const isFavorite =
    quote.driver?.favoriteDriver?.some((fav) => fav.user_id === userId) ??
    false;

  return {
    id: quote.id,
    status: quote.status,
    price: quote.price,
    request: {
      moving_type: quote.request.moving_type,
      moving_data: quote.request.moving_data,
      origin: quote.request.origin,
      destination: quote.request.destination,
      createdAt: quote.request.createdAt,
    },
    driver: {
      id: quote.driver?.id ?? 0,
      nickname: quote.driver?.nickname ?? "",
      driver_years: quote.driver?.driver_years ?? null,
      driver_intro: quote.driver?.driver_intro ?? null,
      rating,
      reviewCount,
      likeCount,
      confirmedCount,
      isFavorite,
    },
  };
}

const getReceivedQuotes = asyncWrapper(
  async (
    req: Request<
      {},
      {},
      {},
      { requestId?: string; status?: string; completedOnly?: string }
    >,
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
        case "COMPLETED":
          return EstimateStatus.COMPLETED;
        default:
          return undefined;
      }
    })();

    const completedOnlyParam = req.query.completedOnly;
    const completedOnly =
      completedOnlyParam === "true" || completedOnlyParam === "1";

    const quotes = await requestUserService.getReceivedQuotes(
      userId,
      requestId,
      status,
      completedOnly
    );

    // 평균 별점, 리뷰/좋아요 수, 확정건수, 즐겨찾기 여부
    const enriched = quotes.map((quote) => enrichQuote(quote, userId));

    return ApiResponse.success(
      res,
      enriched,
      "받은 견적 조회에 성공했습니다.",
      HTTP_STATUS.OK
    );
  }
);

const getPendingQuoteDetail = asyncWrapper(
  async (req: Request<{ estimateId: string }>, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }

    const estimateId = parseEstimateId(req.params.estimateId);

    const quote = await requestUserService.getPendingQuoteDetail(
      userId,
      estimateId
    );

    if (!quote) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "견적을 찾을 수 없습니다.",
        HTTP_CODE.NOT_FOUND
      );
    }

    const enriched = enrichQuote(quote, userId);

    return ApiResponse.success(
      res,
      enriched,
      "대기중인 견적 상세 조회에 성공했습니다.",
      HTTP_STATUS.OK
    );
  }
);

const acceptQuote = asyncWrapper(
  async (req: Request<{ estimateId: string }>, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }

    const estimateId = parseEstimateId(req.params.estimateId);

    const updated = await requestUserService.acceptQuote(userId, estimateId);

    if (!updated) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "견적을 찾을 수 없습니다.",
        HTTP_CODE.NOT_FOUND
      );
    }

    return ApiResponse.success(
      res,
      enrichQuote(updated, userId),
      "견적 확정에 성공했습니다.",
      HTTP_STATUS.OK
    );
  }
);

const getQuoteDetail = asyncWrapper(
  async (req: Request<{ estimateId: string }>, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(
        HTTP_STATUS.AUTH_REQUIRED,
        HTTP_MESSAGE.AUTH_REQUIRED,
        HTTP_CODE.AUTH_REQUIRED
      );
    }

    const estimateId = parseEstimateId(req.params.estimateId);

    const quote = await requestUserService.getQuoteDetail(userId, estimateId);
    if (!quote) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "견적을 찾을 수 없습니다.",
        HTTP_CODE.NOT_FOUND
      );
    }

    return ApiResponse.success(
      res,
      enrichQuote(quote, userId),
      "견적 상세 조회에 성공했습니다.",
      HTTP_STATUS.OK
    );
  }
);

export default {
  getReceivedQuotes,
  getPendingQuoteDetail,
  acceptQuote,
  getQuoteDetail,
};

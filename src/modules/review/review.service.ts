import reviewRepository from "./review.repository";
import ApiError from "../../core/http/ApiError";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../constants/http";
import { CreateReviewBody } from "./review.dto";

async function getReviews(
  driverId?: number,
  userId?: string,
  userIdForQuotes?: string
) {
  return reviewRepository.findReviews({ driverId, userId, userIdForQuotes });
}

async function getWritableReviews(userId: string) {
  return reviewRepository.findWritableReviews({ userId });
}

async function createReview(userId: string, body: CreateReviewBody) {
  const { driverId, rating, review_content, review_title } = body;

  // 중복 체크
  const existing = await reviewRepository.findExistingReview(userId, driverId);
  if (existing) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "이미 해당 기사에게 리뷰를 작성했습니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  // 확정 견적 + 이사 완료 여부
  const accepted = await reviewRepository.hasAcceptedEstimatePast(
    userId,
    driverId
  );
  if (!accepted) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "확정된 이사 완료 이력이 있어야 리뷰를 작성할 수 있습니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  return reviewRepository.createReview({
    userId,
    driverId,
    rating,
    review_content,
    review_title,
  });
}

export default {
  getReviews,
  getWritableReviews,
  createReview,
};

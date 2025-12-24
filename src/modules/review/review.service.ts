import reviewRepository from "./review.repository";

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

export default {
  getReviews,
  getWritableReviews,
};

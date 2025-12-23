import reviewRepository from "./review.repository";

async function getReviews(driverId?: number, userId?: string) {
  return reviewRepository.findReviews({ driverId, userId });
}

async function getWritableReviews(userId: string) {
  return reviewRepository.findWritableReviews({ userId });
}

export default {
  getReviews,
  getWritableReviews,
};

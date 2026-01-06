export interface ReviewListQuery {
  driverId?: number;
  userId?: string;
}

export interface CreateReviewBody {
  driverId: number;
  rating: number;
  review_title?: string;
  review_content?: string;
}

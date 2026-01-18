export interface QuoteDetailResponse {
  id: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  price: number;
  request: {
    moving_type: string;
    moving_data: Date;
    origin: string;
    destination: string;
    createdAt: Date;
  };
  driver: {
    id: number;
    nickname: string;
    driver_years: number | null;
    driver_intro: string | null;
    profileImage?: string | null;
    rating: number;
    reviewCount: number;
    likeCount: number;
    confirmedCount: number;
    isFavorite: boolean;
  };
}

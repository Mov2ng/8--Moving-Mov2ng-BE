import { Request, Response } from "express";
import reviewController from "../review.controller";
import reviewService from "../review.service";
import { HTTP_STATUS, HTTP_CODE } from "../../../constants/http";
import { User } from "@prisma/client";
import { CreateReviewBody } from "../review.dto";
import ApiError from "../../../core/http/ApiError";

// Request.user 타입을 위한 헬퍼 함수 (테스트용 최소 user 객체 생성)
const createMockUser = (id: string): Pick<
  User,
  | "id"
  | "role"
  | "email"
  | "name"
  | "phone_number"
  | "profileImage"
  | "createdAt"
  | "updatedAt"
> => ({
  id,
  role: "USER" as const,
  email: "test@example.com",
  name: "Test User",
  phone_number: "01000000000",
  profileImage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// service 모킹
jest.mock("../review.service");

describe("ReviewController - list", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  it("리뷰 목록 조회 성공 (파라미터 없음)", async () => {
    // Given
    const mockReviews = [
      {
        id: 1,
        driver_id: 10,
        user_id: "1",
        review_content: "좋은 기사님입니다.",
        rating: 5,
      },
    ];

    mockReq = {
      query: {},
    };

    (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);

    // When
    await reviewController.list(
      mockReq as Request<
        {},
        {},
        {},
        { driverId?: string; userId?: string; onlyMyQuotes?: string }
      >,
      mockRes as Response,
      next
    );

    // Then
    expect(reviewService.getReviews).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined
    );
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "리뷰 조회에 성공했습니다.",
        data: mockReviews,
      })
    );
  });

  it("driverId로 필터링하여 조회 성공", async () => {
    // Given
    const driverId = 10;
    const mockReviews = [
      {
        id: 1,
        driver_id: driverId,
        user_id: "1",
        review_content: "좋은 기사님입니다.",
        rating: 5,
      },
    ];

    mockReq = {
      query: { driverId: String(driverId) },
    };

    (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);

    // When
    await reviewController.list(
      mockReq as Request<
        {},
        {},
        {},
        { driverId?: string; userId?: string; onlyMyQuotes?: string }
      >,
      mockRes as Response,
      next
    );

    // Then
    expect(reviewService.getReviews).toHaveBeenCalledWith(
      driverId,
      undefined,
      undefined
    );
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
  });

  it("잘못된 driverId 형식이면 400 에러를 반환한다", async () => {
    // Given
    mockReq = {
      query: { driverId: "invalid" },
    };

    // When
    await reviewController.list(
      mockReq as Request<
        {},
        {},
        {},
        { driverId?: string; userId?: string; onlyMyQuotes?: string }
      >,
      mockRes as Response,
      next
    );

    // Then
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "driverId는 숫자여야 합니다.",
        data: [],
      })
    );
    expect(reviewService.getReviews).not.toHaveBeenCalled();
  });

  it("onlyMyQuotes가 true일 때 현재 사용자 ID를 전달한다", async () => {
    // Given
    const userId = "1";

    mockReq = {
      query: { onlyMyQuotes: "true" },
      user: createMockUser(userId),
    };

    (reviewService.getReviews as jest.Mock).mockResolvedValue([]);

    // When
    await reviewController.list(
      mockReq as Request<
        {},
        {},
        {},
        { driverId?: string; userId?: string; onlyMyQuotes?: string }
      >,
      mockRes as Response,
      next
    );

    // Then
    expect(reviewService.getReviews).toHaveBeenCalledWith(
      undefined,
      undefined,
      userId
    );
  });
});

describe("ReviewController - listMine", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  it("내가 작성한 리뷰 조회 성공", async () => {
    // Given
    const userId = "1";
    const mockReviews = [
      {
        id: 1,
        driver_id: 10,
        user_id: userId,
        review_content: "좋은 기사님입니다.",
        rating: 5,
      },
    ];

    mockReq = {
      user: createMockUser(userId),
    };

    (reviewService.getReviews as jest.Mock).mockResolvedValue(mockReviews);

    // When
    await reviewController.listMine(
      mockReq as Request,
      mockRes as Response,
      next
    );

    // Then
    expect(reviewService.getReviews).toHaveBeenCalledWith(undefined, userId);
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "내가 작성한 리뷰 조회에 성공했습니다.",
        data: mockReviews,
      })
    );
  });

  it("로그인하지 않은 경우 401 에러를 던진다", async () => {
    // Given
    mockReq = {};

    // When
    await reviewController.listMine(
      mockReq as Request,
      mockRes as Response,
      next
    );

    // Then
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HTTP_STATUS.AUTH_REQUIRED,
      })
    );
    expect(reviewService.getReviews).not.toHaveBeenCalled();
  });
});

describe("ReviewController - listWritable", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  it("작성 가능한 리뷰 조회 성공", async () => {
    // Given
    const userId = "1";
    const mockReviews = [
      {
        estimateId: 1,
        driverId: 10,
        driverNickname: "기사님",
        movingDate: new Date(),
      },
    ];

    mockReq = {
      user: createMockUser(userId),
    };

    (reviewService.getWritableReviews as jest.Mock).mockResolvedValue(
      mockReviews
    );

    // When
    await reviewController.listWritable(
      mockReq as Request,
      mockRes as Response,
      next
    );

    // Then
    expect(reviewService.getWritableReviews).toHaveBeenCalledWith(userId);
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "작성 가능한 리뷰 조회에 성공했습니다.",
        data: mockReviews,
      })
    );
  });
});

describe("ReviewController - create", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  it("리뷰 작성 성공", async () => {
    // Given
    const userId = "1";
    const createBody: CreateReviewBody = {
      driverId: 10,
      rating: 5,
      review_title: "좋은 기사님",
      review_content: "친절하고 신속했습니다.",
    };

    const mockCreatedReview = {
      id: 1,
      driver_id: createBody.driverId,
      user_id: userId,
      rating: createBody.rating,
      review_title: createBody.review_title,
      review_content: createBody.review_content,
    };

    mockReq = {
      body: createBody,
      user: createMockUser(userId),
    };

    (reviewService.createReview as jest.Mock).mockResolvedValue(
      mockCreatedReview
    );

    // When
    await reviewController.create(
      mockReq as Request<{}, {}, CreateReviewBody>,
      mockRes as Response,
      next
    );

    // Then
    expect(reviewService.createReview).toHaveBeenCalledWith(userId, createBody);
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "리뷰 작성에 성공했습니다.",
        data: mockCreatedReview,
      })
    );
  });

  it("중복 리뷰 작성 시 409 에러를 던진다", async () => {
    // Given
    const userId = "1";
    const createBody: CreateReviewBody = {
      driverId: 10,
      rating: 5,
      review_content: "좋은 기사님입니다.",
    };

    mockReq = {
      body: createBody,
      user: createMockUser(userId),
    };

    const conflictError = new ApiError(
      HTTP_STATUS.CONFLICT,
      "이미 해당 기사에게 리뷰를 작성했습니다.",
      HTTP_CODE.BAD_REQUEST
    );

    (reviewService.createReview as jest.Mock).mockRejectedValue(conflictError);

    // When
    await reviewController.create(
      mockReq as Request<{}, {}, CreateReviewBody>,
      mockRes as Response,
      next
    );

    // Then
    expect(reviewService.createReview).toHaveBeenCalledWith(userId, createBody);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HTTP_STATUS.CONFLICT,
        message: "이미 해당 기사에게 리뷰를 작성했습니다.",
      })
    );
  });

  it("확정된 이사 완료 이력이 없으면 400 에러를 던진다", async () => {
    // Given
    const userId = "1";
    const createBody: CreateReviewBody = {
      driverId: 10,
      rating: 5,
      review_content: "좋은 기사님입니다.",
    };

    mockReq = {
      body: createBody,
      user: createMockUser(userId),
    };

    const badRequestError = new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "확정된 이사 완료 이력이 있어야 리뷰를 작성할 수 있습니다.",
      HTTP_CODE.BAD_REQUEST
    );

    (reviewService.createReview as jest.Mock).mockRejectedValue(
      badRequestError
    );

    // When
    await reviewController.create(
      mockReq as Request<{}, {}, CreateReviewBody>,
      mockRes as Response,
      next
    );

    // Then
    expect(reviewService.createReview).toHaveBeenCalledWith(userId, createBody);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "확정된 이사 완료 이력이 있어야 리뷰를 작성할 수 있습니다.",
      })
    );
  });
});


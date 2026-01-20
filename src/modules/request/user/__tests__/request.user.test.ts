import { Request, Response } from "express";
import requestController from "../request.user.controller";
import requestService from "../request.user.service";
import { HTTP_STATUS } from "../../../../constants/http";
import { EstimateStatus, User } from "@prisma/client";
import type { QuoteWithDriver } from "../request.user.repository";

// Request.user 타입을 위한 헬퍼 함수 (테스트용 최소 user 객체 생성)
const createMockUser = (id: string): Pick<
  User,
  "id" | "role" | "email" | "name" | "phone_number" | "profileImage" | "createdAt" | "updatedAt"
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
jest.mock("../request.user.service");

describe("RequestController - getPendingQuoteDetail", () => {
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

  it("대기중(ACCEPTED) 견적이 있으면 200과 상세 데이터를 반환한다", async () => {
    // Given
    const userId = "1";
    const estimateId = 1;
    const mockQuote = {
      id: estimateId,
      status: EstimateStatus.ACCEPTED,
      price: 50000,
      request: {
        moving_type: "HOME",
        moving_data: new Date(),
        origin: "서울시 서초구",
        destination: "부산시 해운대구",
        createdAt: new Date(),
      },
      driver: {
        id: 10,
        nickname: "기사님",
        driver_years: 5,
        driver_intro: "안전 운행",
        review: [],
        _count: {
          review: 0,
          likes: 0,
        },
        estimates: [],
        favoriteDriver: [],
      },
    };

    mockReq = {
      params: { estimateId: String(estimateId) },
      user: createMockUser(userId),
    };

    (requestService.getPendingQuoteDetail as jest.Mock).mockResolvedValue(
      mockQuote
    );

    // When
    await requestController.getPendingQuoteDetail(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.getPendingQuoteDetail).toHaveBeenCalledWith(
      userId,
      estimateId
    );
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "대기중인 견적 상세 조회에 성공했습니다.",
        data: expect.objectContaining({
          id: estimateId,
          status: EstimateStatus.ACCEPTED,
          price: 50000,
        }),
      })
    );
  });

  it("견적이 없으면 404 ApiError를 던진다", async () => {
    // Given
    const userId = "1";
    const estimateId = 999;

    mockReq = {
      params: { estimateId: String(estimateId) },
      user: createMockUser(userId),
    };

    (requestService.getPendingQuoteDetail as jest.Mock).mockResolvedValue(null);

    // When
    await requestController.getPendingQuoteDetail(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.getPendingQuoteDetail).toHaveBeenCalledWith(
      userId,
      estimateId
    );
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "견적을 찾을 수 없습니다.",
      })
    );
  });

  it("로그인하지 않은 경우 401 에러를 던진다", async () => {
    // Given
    mockReq = {
      params: { estimateId: "1" },
    };

    // When
    await requestController.getPendingQuoteDetail(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HTTP_STATUS.AUTH_REQUIRED,
      })
    );
    expect(requestService.getPendingQuoteDetail).not.toHaveBeenCalled();
  });

  it("service에서 에러가 발생하면 그대로 전파한다", async () => {
    // Given
    const userId = "1";
    const estimateId = 1;
    const error = new Error("DB Error");

    mockReq = {
      params: { estimateId: String(estimateId) },
      user: createMockUser(userId),
    };

    (requestService.getPendingQuoteDetail as jest.Mock).mockRejectedValue(
      error
    );

    // When
    await requestController.getPendingQuoteDetail(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.getPendingQuoteDetail).toHaveBeenCalledWith(
      userId,
      estimateId
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("RequestController - getReceivedQuotes", () => {
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

  it("받은 견적 목록 조회 성공 (파라미터 없음)", async () => {
      // Given
    const userId = "1";
    const mockQuotes = [
      {
        id: 1,
        status: EstimateStatus.ACCEPTED,
        price: 50000,
        request: {
          moving_type: "HOME",
          moving_data: new Date(),
          origin: "서울시 서초구",
          destination: "부산시 해운대구",
          createdAt: new Date(),
        },
        driver: {
          id: 10,
          nickname: "기사님",
          driver_years: 5,
          driver_intro: "안전 운행",
          review: [],
          _count: {
            review: 0,
            likes: 0,
          },
          estimates: [],
          favoriteDriver: [],
        },
      },
    ];

      mockReq = {
      query: {},
      user: createMockUser(userId),
      };

    (requestService.getReceivedQuotes as jest.Mock).mockResolvedValue(
      mockQuotes
      );

      // When
    await requestController.getReceivedQuotes(
        mockReq as Request,
        mockRes as Response,
        next
      );

      // Then
    expect(requestService.getReceivedQuotes).toHaveBeenCalledWith(
      userId,
      undefined,
      undefined,
      false
    );
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "받은 견적 조회에 성공했습니다.",
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            status: EstimateStatus.ACCEPTED,
            price: 50000,
            driver: expect.objectContaining({
              id: 10,
              nickname: "기사님",
            }),
          }),
        ]),
      })
      );
    });

  it("requestId로 필터링하여 조회 성공", async () => {
    // Given
    const userId = "1";
    const requestId = 5;
    const mockQuotes = [
      {
        id: 1,
        status: EstimateStatus.ACCEPTED,
        price: 50000,
        request: {
          moving_type: "HOME",
          moving_data: new Date(),
          origin: "서울시 서초구",
          destination: "부산시 해운대구",
          createdAt: new Date(),
        },
        driver: {
          id: 10,
          nickname: "기사님",
          driver_years: 5,
          driver_intro: "안전 운행",
          review: [],
          _count: {
            review: 0,
            likes: 0,
          },
          estimates: [],
          favoriteDriver: [],
        },
      },
    ];

    mockReq = {
      query: { requestId: String(requestId) },
      user: createMockUser(userId),
    };

    (requestService.getReceivedQuotes as jest.Mock).mockResolvedValue(
      mockQuotes
    );

    // When
    await requestController.getReceivedQuotes(
      mockReq as Request,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.getReceivedQuotes).toHaveBeenCalledWith(
      userId,
      requestId,
      undefined,
      false
    );
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "받은 견적 조회에 성공했습니다.",
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            status: EstimateStatus.ACCEPTED,
            price: 50000,
          }),
        ]),
      })
    );
  });

  it("status로 필터링하여 조회 성공", async () => {
      // Given
    const userId = "1";
    const status = "ACCEPTED";
    const mockQuotes: QuoteWithDriver[] = [];

      mockReq = {
      query: { status },
      user: createMockUser(userId),
      };

    (requestService.getReceivedQuotes as jest.Mock).mockResolvedValue(
      mockQuotes
    );

      // When
    await requestController.getReceivedQuotes(
        mockReq as Request,
        mockRes as Response,
        next
      );

      // Then
    expect(requestService.getReceivedQuotes).toHaveBeenCalledWith(
      userId,
      undefined,
      EstimateStatus.ACCEPTED,
      false
    );
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "받은 견적 조회에 성공했습니다.",
        data: [],
      })
    );
  });

  it("completedOnly로 필터링하여 조회 성공", async () => {
      // Given
    const userId = "1";
    const completedOnly = "true";
    const mockQuotes: QuoteWithDriver[] = [];

    mockReq = {
      query: { completedOnly },
      user: createMockUser(userId),
    };

    (requestService.getReceivedQuotes as jest.Mock).mockResolvedValue(
      mockQuotes
    );

    // When
    await requestController.getReceivedQuotes(
      mockReq as Request,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.getReceivedQuotes).toHaveBeenCalledWith(
      userId,
      undefined,
      undefined,
      true
    );
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
  });

  it("잘못된 requestId 형식이면 400 에러를 던진다", async () => {
    // Given
    const userId = "1";

    mockReq = {
      query: { requestId: "invalid" },
      user: createMockUser(userId),
    };

      // When
    await requestController.getReceivedQuotes(
        mockReq as Request,
        mockRes as Response,
        next
      );

      // Then
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "requestId는 숫자여야 합니다.",
      })
    );
    expect(requestService.getReceivedQuotes).not.toHaveBeenCalled();
  });
});

describe("RequestController - acceptQuote", () => {
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

  it("ACCEPTED 상태인 견적을 COMPLETED로 변경 성공", async () => {
    // Given
    const userId = "1";
    const estimateId = 1;
    const mockQuote = {
      id: estimateId,
      status: EstimateStatus.ACCEPTED,
      price: 50000,
      request: {
        moving_type: "HOME",
        moving_data: new Date(),
        origin: "서울시 서초구",
        destination: "부산시 해운대구",
        createdAt: new Date(),
      },
      driver: {
        id: 10,
        nickname: "기사님",
        driver_years: 5,
        driver_intro: "안전 운행",
        review: [],
        _count: {
          review: 0,
          likes: 0,
        },
        estimates: [],
        favoriteDriver: [],
      },
    };

    const mockUpdatedQuote = {
      ...mockQuote,
      status: EstimateStatus.COMPLETED,
    };

    mockReq = {
      params: { estimateId: String(estimateId) },
      user: createMockUser(userId),
    };

    (requestService.acceptQuote as jest.Mock).mockResolvedValue(
      mockUpdatedQuote
    );

    // When
    await requestController.acceptQuote(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.acceptQuote).toHaveBeenCalledWith(userId, estimateId);
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "견적 확정에 성공했습니다.",
        data: expect.objectContaining({
          id: estimateId,
          status: EstimateStatus.COMPLETED,
          price: 50000,
        }),
      })
    );
  });

  it("견적이 없으면 404 ApiError를 던진다", async () => {
    // Given
    const userId = "1";
    const estimateId = 999;

    mockReq = {
      params: { estimateId: String(estimateId) },
      user: createMockUser(userId),
    };

    (requestService.acceptQuote as jest.Mock).mockResolvedValue(null);

    // When
    await requestController.acceptQuote(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.acceptQuote).toHaveBeenCalledWith(userId, estimateId);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "견적을 찾을 수 없습니다.",
      })
    );
  });

  it("잘못된 estimateId 형식이면 400 에러를 던진다", async () => {
    // Given
    const userId = "1";

    mockReq = {
      params: { estimateId: "invalid" },
      user: createMockUser(userId),
    };

    // When
    await requestController.acceptQuote(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "estimateId는 숫자여야 합니다.",
      })
    );
    expect(requestService.acceptQuote).not.toHaveBeenCalled();
  });

  it("ACCEPTED 상태가 아니면 변경되지 않고 기존 견적을 반환한다", async () => {
    // Given
    const userId = "1";
    const estimateId = 1;
    const mockQuote = {
      id: estimateId,
      status: EstimateStatus.COMPLETED, // 이미 COMPLETED 상태
      price: 50000,
      request: {
        moving_type: "HOME",
        moving_data: new Date(),
        origin: "서울시 서초구",
        destination: "부산시 해운대구",
        createdAt: new Date(),
      },
      driver: {
        id: 10,
        nickname: "기사님",
        driver_years: 5,
        driver_intro: "안전 운행",
        review: [],
        _count: {
          review: 0,
          likes: 0,
        },
        estimates: [],
        favoriteDriver: [],
      },
    };

    mockReq = {
      params: { estimateId: String(estimateId) },
      user: createMockUser(userId),
    };

    // ACCEPTED가 아니면 변경하지 않고 기존 견적 반환
    (requestService.acceptQuote as jest.Mock).mockResolvedValue(mockQuote);

    // When
    await requestController.acceptQuote(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.acceptQuote).toHaveBeenCalledWith(userId, estimateId);
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "견적 확정에 성공했습니다.",
        data: expect.objectContaining({
          id: estimateId,
          status: EstimateStatus.COMPLETED, // 변경되지 않음
        }),
      })
    );
  });
});

describe("RequestController - getQuoteDetail", () => {
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

  it("견적 상세 조회 성공 (상태와 관계없이)", async () => {
    // Given
    const userId = "1";
    const estimateId = 1;
    const mockQuote = {
      id: estimateId,
      status: EstimateStatus.COMPLETED,
      price: 50000,
      request: {
        moving_type: "HOME",
        moving_data: new Date(),
        origin: "서울시 서초구",
        destination: "부산시 해운대구",
        createdAt: new Date(),
      },
      driver: {
        id: 10,
        nickname: "기사님",
        driver_years: 5,
        driver_intro: "안전 운행",
        review: [],
        _count: {
          review: 0,
          likes: 0,
        },
        estimates: [],
        favoriteDriver: [],
      },
    };

    mockReq = {
      params: { estimateId: String(estimateId) },
      user: createMockUser(userId),
    };

    (requestService.getQuoteDetail as jest.Mock).mockResolvedValue(mockQuote);

    // When
    await requestController.getQuoteDetail(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.getQuoteDetail).toHaveBeenCalledWith(
      userId,
      estimateId
    );
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "견적 상세 조회에 성공했습니다.",
        data: expect.objectContaining({
          id: estimateId,
          status: EstimateStatus.COMPLETED,
          price: 50000,
        }),
      })
    );
  });

  it("견적이 없으면 404 ApiError를 던진다", async () => {
    // Given
    const userId = "1";
    const estimateId = 999;

    mockReq = {
      params: { estimateId: String(estimateId) },
      user: createMockUser(userId),
    };

    (requestService.getQuoteDetail as jest.Mock).mockResolvedValue(null);

    // When
    await requestController.getQuoteDetail(
      mockReq as Request<{ estimateId: string }>,
      mockRes as Response,
      next
    );

    // Then
    expect(requestService.getQuoteDetail).toHaveBeenCalledWith(
      userId,
      estimateId
    );
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: "견적을 찾을 수 없습니다.",
      })
    );
  });
});

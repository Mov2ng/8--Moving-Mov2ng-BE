import { Category, RegionType } from "@prisma/client";
import moverService from "../mover.service";
import moverRepository from "../mover.repository";
import ApiError from "../../../core/http/ApiError";
import { HTTP_STATUS, HTTP_CODE } from "../../../constants/http";

// 모듈 모킹
jest.mock("../mover.repository");

describe("MoverService", () => {
  // 테스트 격리를 위한 mock 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== getMovers 테스트 ==========
  describe("getMovers", () => {
    const mockUserId = "user-id-123";

    // Prisma ORM 결과 mock 데이터
    const createMockPrismaDriver = (id: number) => ({
      id,
      user_id: `driver-user-${id}`,
      nickname: `기사님${id}`,
      driver_years: 5,
      driver_intro: "안녕하세요",
      driver_content: "열심히 하겠습니다",
      createdAt: new Date(),
      updatedAt: new Date(),
      isDelete: false,
      user: {
        profileImage: `https://example.com/profile${id}.jpg`,
        service: [{ category: Category.SMALL }],
        region: [{ region: RegionType.SEOUL }],
      },
      review: [{ rating: 5 }, { rating: 4 }],
      favoriteDriver: [],
      _count: {
        review: 2,
        favoriteDriver: 10,
        estimates: 5,
      },
    });

    // Raw Query 결과 mock 데이터
    const createMockRawQueryDriver = (id: number) => ({
      id,
      userId: `driver-user-${id}`,
      nickname: `기사님${id}`,
      driverYears: 5,
      driverIntro: "안녕하세요",
      driverContent: "열심히 하겠습니다",
      profileImage: `https://example.com/profile${id}.jpg`,
      createdAt: new Date(),
      ratingAvg: 4.5,
      reviewCount: 10,
      favoriteCount: 20,
      confirmCount: 15,
      serviceCategories: [Category.SMALL],
      regions: [RegionType.SEOUL],
      isFavorite: false,
    });

    describe("Prisma ORM 사용 (review, career 정렬)", () => {
      it("기본 정렬로 기사님 목록을 조회해야 함", async () => {
        // Given
        const mockDrivers = [
          createMockPrismaDriver(1),
          createMockPrismaDriver(2),
          createMockPrismaDriver(3),
        ];

        (moverRepository.getMovers as jest.Mock).mockResolvedValue(mockDrivers);

        // When
        const result = await moverService.getMovers(
          { limit: 10 },
          mockUserId
        );

        // Then
        expect(result.list).toHaveLength(3);
        expect(result.hasNext).toBe(false);
        expect(result.nextCursor).toBeNull();
        expect(moverRepository.getMovers).toHaveBeenCalledTimes(1);
      });

      it("다음 페이지가 있으면 hasNext가 true여야 함", async () => {
        // Given
        const mockDrivers = Array.from({ length: 11 }, (_, i) =>
          createMockPrismaDriver(i + 1)
        );

        (moverRepository.getMovers as jest.Mock).mockResolvedValue(mockDrivers);

        // When
        const result = await moverService.getMovers(
          { limit: 10 },
          mockUserId
        );

        // Then
        expect(result.list).toHaveLength(10);
        expect(result.hasNext).toBe(true);
        expect(result.nextCursor).toBe(11);
      });

      it("keyword로 검색할 수 있어야 함", async () => {
        // Given
        const mockDrivers = [createMockPrismaDriver(1)];

        (moverRepository.getMovers as jest.Mock).mockResolvedValue(mockDrivers);

        // When
        const result = await moverService.getMovers(
          { keyword: "친절한", limit: 10 },
          mockUserId
        );

        // Then
        expect(moverRepository.getMovers).toHaveBeenCalledWith(
          expect.objectContaining({ keyword: "친절한" })
        );
        expect(result.list).toHaveLength(1);
      });

      it("region으로 필터링할 수 있어야 함", async () => {
        // Given
        const mockDrivers = [createMockPrismaDriver(1)];

        (moverRepository.getMovers as jest.Mock).mockResolvedValue(mockDrivers);

        // When
        const result = await moverService.getMovers(
          { region: RegionType.SEOUL, limit: 10 },
          mockUserId
        );

        // Then
        expect(moverRepository.getMovers).toHaveBeenCalledWith(
          expect.objectContaining({ region: RegionType.SEOUL })
        );
      });

      it("service로 필터링할 수 있어야 함", async () => {
        // Given
        const mockDrivers = [createMockPrismaDriver(1)];

        (moverRepository.getMovers as jest.Mock).mockResolvedValue(mockDrivers);

        // When
        const result = await moverService.getMovers(
          { service: Category.HOME, limit: 10 },
          mockUserId
        );

        // Then
        expect(moverRepository.getMovers).toHaveBeenCalledWith(
          expect.objectContaining({ service: Category.HOME })
        );
      });

      it("평점 계산이 올바르게 되어야 함", async () => {
        // Given
        const mockDriver = createMockPrismaDriver(1);
        mockDriver.review = [{ rating: 5 }, { rating: 4 }, { rating: 3 }];

        (moverRepository.getMovers as jest.Mock).mockResolvedValue([mockDriver]);

        // When
        const result = await moverService.getMovers({ limit: 10 }, mockUserId);

        // Then
        expect(result.list[0].rating).toBe(4); // (5+4+3)/3 = 4
      });

      it("리뷰가 없으면 평점이 0이어야 함", async () => {
        // Given
        const mockDriver = createMockPrismaDriver(1);
        mockDriver.review = [];

        (moverRepository.getMovers as jest.Mock).mockResolvedValue([mockDriver]);

        // When
        const result = await moverService.getMovers({ limit: 10 }, mockUserId);

        // Then
        expect(result.list[0].rating).toBe(0);
      });
    });

    describe("Raw Query 사용 (rating, confirm 정렬)", () => {
      it("rating 정렬로 조회하면 Raw Query를 사용해야 함", async () => {
        // Given
        const mockDrivers = [
          createMockRawQueryDriver(1),
          createMockRawQueryDriver(2),
        ];

        (moverRepository.getMoversByRawQuery as jest.Mock).mockResolvedValue(
          mockDrivers
        );

        // When
        const result = await moverService.getMovers(
          { sort: "rating", limit: 10 },
          mockUserId
        );

        // Then
        expect(moverRepository.getMoversByRawQuery).toHaveBeenCalledTimes(1);
        expect(moverRepository.getMovers).not.toHaveBeenCalled();
        expect(result.list).toHaveLength(2);
      });

      it("confirm 정렬로 조회하면 Raw Query를 사용해야 함", async () => {
        // Given
        const mockDrivers = [createMockRawQueryDriver(1)];

        (moverRepository.getMoversByRawQuery as jest.Mock).mockResolvedValue(
          mockDrivers
        );

        // When
        const result = await moverService.getMovers(
          { sort: "confirm", limit: 10 },
          mockUserId
        );

        // Then
        expect(moverRepository.getMoversByRawQuery).toHaveBeenCalledWith(
          expect.objectContaining({ sortBy: "confirm" })
        );
      });
    });
  });

  // ========== getMoverDetailFull 테스트 ==========
  describe("getMoverDetailFull", () => {
    const mockDriverId = 1;
    const mockUserId = "user-id-123";

    const mockDriverDetail = {
      id: mockDriverId,
      user_id: "driver-user-1",
      nickname: "친절한 기사님",
      driver_years: 10,
      driver_intro: "안녕하세요",
      driver_content: "최선을 다하겠습니다",
      createdAt: new Date(),
      updatedAt: new Date(),
      isDelete: false,
      user: {
        service: [{ category: Category.SMALL }, { category: Category.HOME }],
        region: [{ region: RegionType.SEOUL }, { region: RegionType.GYEONGGI }],
      },
      review: [
        {
          id: 1,
          rating: 5,
          review_title: "최고예요",
          review_content: "정말 좋았습니다",
          createdAt: new Date(),
          user: { id: "reviewer-1", name: "홍길동" },
        },
        {
          id: 2,
          rating: 4,
          review_title: "만족합니다",
          review_content: "친절하셨어요",
          createdAt: new Date(),
          user: { id: "reviewer-2", name: "김철수" },
        },
      ],
      favoriteDriver: [],
      _count: {
        review: 2,
        favoriteDriver: 15,
        estimates: 30,
      },
    };

    describe("성공 케이스", () => {
      it("기사님 상세 정보를 조회해야 함", async () => {
        // Given
        (moverRepository.getMoverDetailFull as jest.Mock).mockResolvedValue(
          mockDriverDetail
        );

        // When
        const result = await moverService.getMoverDetailFull(
          mockDriverId,
          mockUserId
        );

        // Then
        expect(result).not.toBeNull();
        expect(result?.id).toBe(mockDriverId);
        expect(result?.nickname).toBe("친절한 기사님");
        expect(result?.serviceCategories).toEqual([Category.SMALL, Category.HOME]);
        expect(result?.regions).toEqual([RegionType.SEOUL, RegionType.GYEONGGI]);
        expect(result?.rating).toBe(4.5); // (5+4)/2 = 4.5
        expect(result?.reviewCount).toBe(2);
        expect(result?.reviews).toHaveLength(2);
      });

      it("리뷰 정보가 올바르게 포맷되어야 함", async () => {
        // Given
        (moverRepository.getMoverDetailFull as jest.Mock).mockResolvedValue(
          mockDriverDetail
        );

        // When
        const result = await moverService.getMoverDetailFull(
          mockDriverId,
          mockUserId
        );

        // Then
        expect(result?.reviews[0]).toMatchObject({
          id: 1,
          rating: 5,
          title: "최고예요",
          content: "정말 좋았습니다",
          user: { id: "reviewer-1", name: "홍길동" },
        });
      });

      it("즐겨찾기한 기사님이면 isFavorite이 true여야 함", async () => {
        // Given
        const driverWithFavorite = {
          ...mockDriverDetail,
          favoriteDriver: [{ id: 1 }],
        };

        (moverRepository.getMoverDetailFull as jest.Mock).mockResolvedValue(
          driverWithFavorite
        );

        // When
        const result = await moverService.getMoverDetailFull(
          mockDriverId,
          mockUserId
        );

        // Then
        expect(result?.isFavorite).toBe(true);
      });
    });

    describe("실패 케이스", () => {
      it("존재하지 않는 기사님이면 null을 반환해야 함", async () => {
        // Given
        (moverRepository.getMoverDetailFull as jest.Mock).mockResolvedValue(null);

        // When
        const result = await moverService.getMoverDetailFull(999, mockUserId);

        // Then
        expect(result).toBeNull();
      });
    });
  });

  // ========== getMoverDetailExtra 테스트 ==========
  describe("getMoverDetailExtra", () => {
    const mockDriverId = 1;

    const mockDriverExtra = {
      id: mockDriverId,
      driver_content: "상세 소개글입니다",
      updatedAt: new Date(),
      review: [
        {
          id: 1,
          rating: 5,
          review_title: "최고예요",
          review_content: "정말 좋았습니다",
          createdAt: new Date(),
          user: { id: "reviewer-1", name: "홍길동" },
        },
      ],
    };

    describe("성공 케이스", () => {
      it("기사님 추가 정보를 조회해야 함", async () => {
        // Given
        (moverRepository.getMoverDetailExtra as jest.Mock).mockResolvedValue(
          mockDriverExtra
        );

        // When
        const result = await moverService.getMoverDetailExtra(mockDriverId);

        // Then
        expect(result).not.toBeNull();
        expect(result?.id).toBe(mockDriverId);
        expect(result?.driverContent).toBe("상세 소개글입니다");
        expect(result?.reviews).toHaveLength(1);
      });
    });

    describe("실패 케이스", () => {
      it("존재하지 않는 기사님이면 null을 반환해야 함", async () => {
        // Given
        (moverRepository.getMoverDetailExtra as jest.Mock).mockResolvedValue(null);

        // When
        const result = await moverService.getMoverDetailExtra(999);

        // Then
        expect(result).toBeNull();
      });
    });
  });

  // ========== getMyMoverDetail 테스트 ==========
  describe("getMyMoverDetail", () => {
    const mockUserId = "driver-user-123";

    describe("성공 케이스", () => {
      it("본인 기사님 정보를 조회해야 함", async () => {
        // Given
        const mockDriver = { id: 1, user_id: mockUserId };
        const mockDriverDetail = {
          id: 1,
          user_id: mockUserId,
          nickname: "나의 닉네임",
          driver_years: 5,
          driver_intro: "안녕하세요",
          driver_content: "소개글",
          createdAt: new Date(),
          updatedAt: new Date(),
          isDelete: false,
          user: {
            service: [{ category: Category.SMALL }],
            region: [{ region: RegionType.SEOUL }],
          },
          review: [],
          favoriteDriver: [],
          _count: { review: 0, favoriteDriver: 0, estimates: 0 },
        };

        (moverRepository.findDriverByUserId as jest.Mock).mockResolvedValue(
          mockDriver
        );
        (moverRepository.getMoverDetailFull as jest.Mock).mockResolvedValue(
          mockDriverDetail
        );

        // When
        const result = await moverService.getMyMoverDetail(mockUserId);

        // Then
        expect(result).not.toBeNull();
        expect(result?.nickname).toBe("나의 닉네임");
        expect(moverRepository.findDriverByUserId).toHaveBeenCalledWith(mockUserId);
        expect(moverRepository.getMoverDetailFull).toHaveBeenCalledWith(1, mockUserId);
      });
    });

    describe("실패 케이스", () => {
      it("기사님 프로필이 없으면 FORBIDDEN 에러를 던져야 함", async () => {
        // Given
        (moverRepository.findDriverByUserId as jest.Mock).mockResolvedValue(null);

        // When & Then
        await expect(
          moverService.getMyMoverDetail(mockUserId)
        ).rejects.toThrow(ApiError);

        const error = await moverService
          .getMyMoverDetail(mockUserId)
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
        expect(error.code).toBe(HTTP_CODE.FORBIDDEN);
        expect(error.message).toBe("기사님 프로필을 먼저 등록해주세요.");
      });
    });
  });

  // ========== createMoverFavorite 테스트 ==========
  describe("createMoverFavorite", () => {
    const mockDriverId = 1;
    const mockUserId = "user-id-123";

    describe("성공 케이스", () => {
      it("기사님 즐겨찾기를 생성해야 함", async () => {
        // Given
        const mockFavorite = {
          id: 1,
          driver_id: mockDriverId,
          user_id: mockUserId,
          isDelete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (moverRepository.createMoverFavorite as jest.Mock).mockResolvedValue(
          mockFavorite
        );

        // When
        const result = await moverService.createMoverFavorite(
          mockDriverId,
          mockUserId
        );

        // Then
        expect(result).toEqual(mockFavorite);
        expect(moverRepository.createMoverFavorite).toHaveBeenCalledWith(
          mockDriverId,
          mockUserId
        );
      });
    });
  });

  // ========== deleteMoverFavorite 테스트 ==========
  describe("deleteMoverFavorite", () => {
    const mockDriverId = 1;
    const mockUserId = "user-id-123";

    describe("성공 케이스", () => {
      it("기사님 즐겨찾기를 삭제해야 함", async () => {
        // Given
        const mockDeletedFavorite = {
          id: 1,
          driver_id: mockDriverId,
          user_id: mockUserId,
          isDelete: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (moverRepository.deleteMoverFavorite as jest.Mock).mockResolvedValue(
          mockDeletedFavorite
        );

        // When
        const result = await moverService.deleteMoverFavorite(
          mockDriverId,
          mockUserId
        );

        // Then
        expect(result).toEqual(mockDeletedFavorite);
        expect(moverRepository.deleteMoverFavorite).toHaveBeenCalledWith(
          mockDriverId,
          mockUserId
        );
      });
    });
  });

  // ========== getFavoriteDrivers 테스트 ==========
  describe("getFavoriteDrivers", () => {
    const mockUserId = "user-id-123";

    const createMockFavoriteDriver = (id: number) => ({
      id,
      driver_id: id,
      user_id: mockUserId,
      isDelete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      driver: {
        id,
        nickname: `기사님${id}`,
        driver_years: 5 + id,
        user: {
          profileImage: `https://example.com/profile${id}.jpg`,
          service: [{ category: Category.SMALL }],
        },
        review: [{ rating: 5 }, { rating: 4 }],
        _count: {
          estimates: 10 + id,
          favoriteDriver: 20 + id,
        },
      },
    });

    describe("성공 케이스", () => {
      it("즐겨찾기한 기사님 목록을 조회해야 함", async () => {
        // Given
        const mockFavorites = [
          createMockFavoriteDriver(1),
          createMockFavoriteDriver(2),
        ];

        (moverRepository.getFavoriteDriversByUser as jest.Mock).mockResolvedValue(
          mockFavorites
        );

        // When
        const result = await moverService.getFavoriteDrivers(mockUserId);

        // Then
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(1);
        expect(result[0].nickname).toBe("기사님1");
        expect(result[0].isFavorite).toBe(true);
      });

      it("평점이 올바르게 계산되어야 함", async () => {
        // Given
        const mockFavorites = [createMockFavoriteDriver(1)];

        (moverRepository.getFavoriteDriversByUser as jest.Mock).mockResolvedValue(
          mockFavorites
        );

        // When
        const result = await moverService.getFavoriteDrivers(mockUserId);

        // Then
        expect(result[0].rating).toBe(4.5); // (5+4)/2 = 4.5
        expect(result[0].ratingCount).toBe(2);
      });

      it("즐겨찾기가 없으면 빈 배열을 반환해야 함", async () => {
        // Given
        (moverRepository.getFavoriteDriversByUser as jest.Mock).mockResolvedValue(
          []
        );

        // When
        const result = await moverService.getFavoriteDrivers(mockUserId);

        // Then
        expect(result).toEqual([]);
      });

      it("driver가 null인 즐겨찾기는 필터링되어야 함", async () => {
        // Given
        const mockFavorites = [
          createMockFavoriteDriver(1),
          { id: 2, driver_id: 2, user_id: mockUserId, driver: null },
        ];

        (moverRepository.getFavoriteDriversByUser as jest.Mock).mockResolvedValue(
          mockFavorites
        );

        // When
        const result = await moverService.getFavoriteDrivers(mockUserId);

        // Then
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
      });
    });
  });
});


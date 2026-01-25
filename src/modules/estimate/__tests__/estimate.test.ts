import { Category } from "@prisma/client";
import estimateService from "../estimate.service";
import estimateRepository from "../estimate.repository";
import ApiError from "../../../core/http/ApiError";
import { HTTP_STATUS, HTTP_CODE, HTTP_MESSAGE } from "../../../constants/http";

// 모듈 모킹
jest.mock("../estimate.repository");

describe("EstimateService", () => {
  // 테스트 격리를 위한 mock 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== postEstimate 테스트 ==========
  describe("postEstimate", () => {
    const mockUserId = "user-id-123";
    const mockEstimateData = {
      movingType: Category.SMALL,
      movingDate: new Date("2026-03-01"),
      origin: "서울시 강남구",
      destination: "경기도 성남시",
    };

    describe("성공 케이스", () => {
      it("새로운 견적 요청을 성공적으로 생성해야 함", async () => {
        // Given
        const mockCreatedEstimate = { 
          id: 1,
          user_id: mockUserId,
          moving_type: mockEstimateData.movingType,
          moving_data: mockEstimateData.movingDate,
          origin: mockEstimateData.origin,
          destination: mockEstimateData.destination,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (estimateRepository.postEstimate as jest.Mock).mockResolvedValue(
          mockCreatedEstimate
        );

        // When
        const result = await estimateService.postEstimate(
          mockEstimateData,
          mockUserId
        );

        // Then
        expect(result).toEqual(mockCreatedEstimate);
        expect(estimateRepository.postEstimate).toHaveBeenCalledWith(
          mockEstimateData,
          mockUserId
        );
        expect(estimateRepository.postEstimate).toHaveBeenCalledTimes(1);
      });

      it("HOME 타입으로 견적 요청을 생성할 수 있어야 함", async () => {
        // Given
        const homeEstimateData = {
          ...mockEstimateData,
          movingType: Category.HOME,
        };
        const mockCreatedEstimate = {
          id: 2,
          user_id: mockUserId,
          moving_type: Category.HOME,
          moving_data: homeEstimateData.movingDate,
          origin: homeEstimateData.origin,
          destination: homeEstimateData.destination,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (estimateRepository.postEstimate as jest.Mock).mockResolvedValue(
          mockCreatedEstimate
        );

        // When
        const result = await estimateService.postEstimate(
          homeEstimateData,
          mockUserId
        );

        // Then
        expect(result).toEqual(mockCreatedEstimate);
        expect(result.moving_type).toBe(Category.HOME);
      });

      it("OFFICE 타입으로 견적 요청을 생성할 수 있어야 함", async () => {
        // Given
        const officeEstimateData = {
          ...mockEstimateData,
          movingType: Category.OFFICE,
        };
        const mockCreatedEstimate = {
          id: 3,
          user_id: mockUserId,
          moving_type: Category.OFFICE,
          moving_data: officeEstimateData.movingDate,
          origin: officeEstimateData.origin,
          destination: officeEstimateData.destination,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (estimateRepository.postEstimate as jest.Mock).mockResolvedValue(
          mockCreatedEstimate
        );

        // When
        const result = await estimateService.postEstimate(
          officeEstimateData,
          mockUserId
        );

        // Then
        expect(result).toEqual(mockCreatedEstimate);
        expect(result.moving_type).toBe(Category.OFFICE);
      });
    });

    describe("실패 케이스", () => {
      it("repository에서 에러가 발생하면 에러를 전파해야 함", async () => {
        // Given
        const mockError = new Error("Database error");
        (estimateRepository.postEstimate as jest.Mock).mockRejectedValue(
          mockError
        );

        // When & Then
        await expect(
          estimateService.postEstimate(mockEstimateData, mockUserId)
        ).rejects.toThrow("Database error");
      });
    });
  });

  // ========== requestEstimate 테스트 ==========
  describe("requestEstimate", () => {
    const mockUserId = "user-id-123";
    const mockDriverId = 1;

    describe("성공 케이스", () => {
      it("기사님 지정 견적 요청을 성공적으로 생성해야 함", async () => {
        // Given
        const mockActiveRequest = {
          id: 10,
          user_id: mockUserId,
          moving_type: Category.SMALL,
          moving_data: new Date("2026-03-01"),
          origin: "서울시 강남구",
          destination: "경기도 성남시",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockCreatedEstimate = {
          id: 1,
          request_id: mockActiveRequest.id,
          driver_id: mockDriverId,
          status: "PENDING",
          price: 0,
          isRequest: true,
          request_reson: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (estimateRepository.getActiveEstimate as jest.Mock).mockResolvedValue(
          mockActiveRequest
        );
        (estimateRepository.postRequestEstimate as jest.Mock).mockResolvedValue(
          mockCreatedEstimate
        );

        // When
        const result = await estimateService.requestEstimate(
          mockDriverId,
          mockUserId
        );

        // Then
        expect(result).toEqual(mockCreatedEstimate);
        expect(estimateRepository.getActiveEstimate).toHaveBeenCalledWith(
          mockUserId
        );
        expect(estimateRepository.postRequestEstimate).toHaveBeenCalledWith(
          mockDriverId,
          mockActiveRequest.id
        );
      });

      it("다른 기사님에게도 견적 요청을 생성할 수 있어야 함", async () => {
        // Given
        const anotherDriverId = 5;
        const mockActiveRequest = {
          id: 20,
          user_id: mockUserId,
          moving_type: Category.HOME,
          moving_data: new Date("2026-04-15"),
          origin: "부산시 해운대구",
          destination: "서울시 송파구",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockCreatedEstimate = {
          id: 2,
          request_id: mockActiveRequest.id,
          driver_id: anotherDriverId,
          status: "PENDING",
          price: 0,
          isRequest: true,
          request_reson: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (estimateRepository.getActiveEstimate as jest.Mock).mockResolvedValue(
          mockActiveRequest
        );
        (estimateRepository.postRequestEstimate as jest.Mock).mockResolvedValue(
          mockCreatedEstimate
        );

        // When
        const result = await estimateService.requestEstimate(
          anotherDriverId,
          mockUserId
        );

        // Then
        expect(result).toEqual(mockCreatedEstimate);
        expect(result.driver_id).toBe(anotherDriverId);
      });
    });

    describe("실패 케이스", () => {
      it("활성화된 견적이 없으면 NOT_FOUND 에러를 던져야 함", async () => {
        // Given
        (estimateRepository.getActiveEstimate as jest.Mock).mockResolvedValue(
          null
        );

        // When & Then
        await expect(
          estimateService.requestEstimate(mockDriverId, mockUserId)
        ).rejects.toThrow(ApiError);

        const error = await estimateService
          .requestEstimate(mockDriverId, mockUserId)
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
        expect(error.code).toBe(HTTP_CODE.ESTIMATE_NOT_FOUND);
        expect(error.message).toBe(HTTP_MESSAGE.ESTIMATE_NOT_FOUND);
      });

      it("활성화된 견적이 없으면 postRequestEstimate가 호출되지 않아야 함", async () => {
        // Given
        (estimateRepository.getActiveEstimate as jest.Mock).mockResolvedValue(
          null
        );

        // When & Then
        await expect(
          estimateService.requestEstimate(mockDriverId, mockUserId)
        ).rejects.toThrow(ApiError);

        expect(estimateRepository.postRequestEstimate).not.toHaveBeenCalled();
      });

      it("postRequestEstimate에서 에러가 발생하면 에러를 전파해야 함", async () => {
        // Given
        const mockActiveRequest = {
          id: 10,
          user_id: mockUserId,
          moving_type: Category.SMALL,
          moving_data: new Date("2026-03-01"),
          origin: "서울시 강남구",
          destination: "경기도 성남시",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockError = new Error("Database error");

        (estimateRepository.getActiveEstimate as jest.Mock).mockResolvedValue(
          mockActiveRequest
        );
        (estimateRepository.postRequestEstimate as jest.Mock).mockRejectedValue(
          mockError
        );

        // When & Then
        await expect(
          estimateService.requestEstimate(mockDriverId, mockUserId)
        ).rejects.toThrow("Database error");
      });
    });
  });
});

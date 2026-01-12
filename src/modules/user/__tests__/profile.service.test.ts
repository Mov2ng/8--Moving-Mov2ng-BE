import { Role, Category, RegionType } from "@prisma/client";
import profileService from "../profile.service";
import profileRepository from "../profile.repository";
import authRepository from "../../auth/auth.repository";
import prisma from "../../../config/db";
import ApiError from "../../../core/http/ApiError";
import { HTTP_STATUS, HTTP_MESSAGE, HTTP_CODE } from "../../../constants/http";

// 모듈 모킹
jest.mock("../profile.repository");
jest.mock("../../auth/auth.repository");
jest.mock("../../../config/db", () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
  },
}));

// 프로필 생성 테스트 그룹
describe("ProfileService - createProfile", () => {
  const mockUserId = "test-user-id";
  const mockTx = {} as any;

  // 테스트 전 실행 코드 (테스트 격리용)
  beforeEach(() => {
    jest.clearAllMocks();
    // prisma.$transaction 모킹
    (prisma.$transaction as jest.Mock).mockImplementation((callback) => {
      return callback(mockTx);
    });
  });

  // 성공 케이스 테스트
  describe("성공 케이스", () => {
    // it(테스트 설명, 테스트 함수)
    it("DRIVER 역할 사용자의 프로필을 성공적으로 생성해야 함", async () => {
      // Given
      const mockProfile = {
        profileImage: "https://example.com/image.jpg",
        serviceCategories: [Category.SMALL, Category.HOME] as Category[],
        region: [RegionType.SEOUL, RegionType.GYEONGGI] as RegionType[],
        nickname: "테스트기사",
        driverYears: 5,
        driverIntro: "친절한 기사입니다",
        driverContent: "안전하게 이사해드립니다",
      };

      // Given: 기존 사용자 정보
      const mockExistingUser = {
        id: mockUserId,
        email: "driver@test.com",
        phone_number: "01012345678",
        name: "테스트기사",
        profileImage: null,
        role: Role.DRIVER,
        provider: "LOCAL",
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        service: [],
        region: [],
        driver: [],
      };

      // Given: 생성된 프로필 정보
      const mockCreatedProfile = {
        ...mockExistingUser,
        profileImage: mockProfile.profileImage,
        service: [
          { id: 1, category: Category.SMALL },
          { id: 2, category: Category.HOME },
        ],
        region: [
          { id: 1, region: RegionType.SEOUL },
          { id: 2, region: RegionType.GYEONGGI },
        ],
        driver: [
          {
            id: 1,
            user_id: mockUserId,
            nickname: mockProfile.nickname,
            driver_years: mockProfile.driverYears,
            driver_intro: mockProfile.driverIntro,
            driver_content: mockProfile.driverContent,
            isDelete: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      // Given: 프로필 조회 모킹
      (profileRepository.findProfileByUserId as jest.Mock)
        .mockResolvedValueOnce(mockExistingUser) // 첫 번째 호출: 기존 프로필 확인
        .mockResolvedValueOnce(mockCreatedProfile); // 두 번째 호출: 생성된 프로필 반환

      // Given: 사용자 정보 업데이트 모킹
      (authRepository.updateUser as jest.Mock).mockResolvedValue(undefined);
      // Given: 서비스 생성 모킹
      (profileRepository.createServices as jest.Mock).mockResolvedValue(
        undefined
      );
      // Given: 지역 생성 모킹
      (profileRepository.createRegions as jest.Mock).mockResolvedValue(
        undefined
      );
      // Given: 드라이버 생성 모킹
      (profileRepository.createDriver as jest.Mock).mockResolvedValue(
        undefined
      );

      // When
      const result = await profileService.createProfile(
        mockUserId,
        mockProfile
      );

      // Then
      // Then: 생성된 프로필 정보 검증
      expect(result).toMatchObject({
        id: mockUserId,
        email: "driver@test.com",
        phone_number: "01012345678",
        name: "테스트기사",
        profileImage: mockProfile.profileImage,
        role: Role.DRIVER,
        provider: "LOCAL",
        isDelete: false,
        serviceCategories: [Category.SMALL, Category.HOME],
        region: [RegionType.SEOUL, RegionType.GYEONGGI],
      });
      // Then: 생성일시 및 수정일시 검증
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      // Then: 프로필 조회 모킹 검증
      expect(profileRepository.findProfileByUserId).toHaveBeenCalledTimes(2);
      // Then: 사용자 정보 업데이트 모킹 검증
      expect(authRepository.updateUser).toHaveBeenCalledWith(
        mockUserId,
        { profileImage: mockProfile.profileImage },
        mockTx
      );
      // Then: 서비스 생성 모킹 검증
      expect(profileRepository.createServices).toHaveBeenCalledWith(
        [
          { user_id: mockUserId, category: Category.SMALL },
          { user_id: mockUserId, category: Category.HOME },
        ],
        mockTx
      );
      // Then: 지역 생성 모킹 검증
      expect(profileRepository.createRegions).toHaveBeenCalledWith(
        [
          { user_id: mockUserId, region: RegionType.SEOUL },
          { user_id: mockUserId, region: RegionType.GYEONGGI },
        ],
        mockTx
      );
      // Then: 드라이버 생성 모킹 검증
      expect(profileRepository.createDriver).toHaveBeenCalledWith(
        {
          user_id: mockUserId,
          nickname: mockProfile.nickname,
          driver_years: mockProfile.driverYears,
          driver_intro: mockProfile.driverIntro,
          driver_content: mockProfile.driverContent,
        },
        mockTx
      );
    });

    it("USER 역할 사용자의 프로필을 성공적으로 생성해야 함 (Driver 정보 없이)", async () => {
      // Given
      const mockProfile = {
        profileImage: "https://example.com/image.jpg",
        serviceCategories: [Category.OFFICE] as Category[],
        region: [RegionType.BUSAN] as RegionType[],
      };

      // Given: 기존 사용자 정보
      const mockExistingUser = {
        id: mockUserId,
        email: "user@test.com",
        phone_number: "01012345678",
        name: "테스트유저",
        profileImage: null,
        role: Role.USER,
        provider: "LOCAL",
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        service: [],
        region: [],
        driver: [],
      };

      // Given: 생성된 프로필 정보
      const mockCreatedProfile = {
        ...mockExistingUser,
        profileImage: mockProfile.profileImage,
        service: [{ id: 1, category: Category.OFFICE }],
        region: [{ id: 1, region: RegionType.BUSAN }],
        driver: [],
      };

      // Given: 프로필 조회 모킹
      (profileRepository.findProfileByUserId as jest.Mock)
        .mockResolvedValueOnce(mockExistingUser)
        .mockResolvedValueOnce(mockCreatedProfile);

      // Given: 사용자 정보 업데이트 모킹
      (authRepository.updateUser as jest.Mock).mockResolvedValue(undefined);
      // Given: 서비스 생성 모킹
      (profileRepository.createServices as jest.Mock).mockResolvedValue(
        undefined
      );
      // Given: 지역 생성 모킹
      (profileRepository.createRegions as jest.Mock).mockResolvedValue(
        undefined
      );

      // When
      const result = await profileService.createProfile(
        mockUserId,
        mockProfile
      );

      // Then
      expect(result.serviceCategories).toEqual([Category.OFFICE]);
      expect(result.region).toEqual([RegionType.BUSAN]);
      expect(profileRepository.createDriver).not.toHaveBeenCalled();
    });

    it("profileImage가 없어도 프로필을 생성할 수 있어야 함", async () => {
      // Given
      const mockProfile = {
        serviceCategories: [Category.SMALL] as Category[],
        region: [RegionType.SEOUL] as RegionType[],
      };

      const mockExistingUser = {
        id: mockUserId,
        email: "user@test.com",
        phone_number: "01012345678",
        name: "테스트유저",
        profileImage: null,
        role: Role.USER,
        provider: "LOCAL",
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        service: [],
        region: [],
        driver: [],
      };

      const mockCreatedProfile = {
        ...mockExistingUser,
        service: [{ id: 1, category: Category.SMALL }],
        region: [{ id: 1, region: RegionType.SEOUL }],
        driver: [],
      };

      (profileRepository.findProfileByUserId as jest.Mock)
        .mockResolvedValueOnce(mockExistingUser)
        .mockResolvedValueOnce(mockCreatedProfile);

      (profileRepository.createServices as jest.Mock).mockResolvedValue(
        undefined
      );
      (profileRepository.createRegions as jest.Mock).mockResolvedValue(
        undefined
      );

      // When
      const result = await profileService.createProfile(
        mockUserId,
        mockProfile
      );

      // Then
      expect(result).toBeDefined();
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  // 실패 케이스 테스트
  describe("실패 케이스", () => {
    it("사용자가 존재하지 않으면 USER_NOT_FOUND 에러를 던져야 함", async () => {
      // Given
      const mockProfile = {
        serviceCategories: [Category.SMALL] as Category[],
        region: [RegionType.SEOUL] as RegionType[],
      };

      // Given: 프로필 조회 모킹
      (
        profileRepository.findProfileByUserId as jest.Mock
      ).mockResolvedValueOnce(null);

      // When & Then
      await expect(
        profileService.createProfile(mockUserId, mockProfile)
      ).rejects.toThrow(ApiError);

      await expect(
        profileService.createProfile(mockUserId, mockProfile)
      ).rejects.toThrow(HTTP_MESSAGE.USER_NOT_FOUND);
    });

    it("이미 프로필이 등록되어 있으면 PROFILE_ALREADY_EXISTS 에러를 던져야 함", async () => {
      // Given
      const mockProfile = {
        serviceCategories: [Category.SMALL] as Category[],
        region: [RegionType.SEOUL] as RegionType[],
      };

      const mockExistingUser = {
        id: mockUserId,
        email: "user@test.com",
        phone_number: "01012345678",
        name: "테스트유저",
        profileImage: null,
        role: Role.USER,
        provider: "LOCAL",
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        service: [{ id: 1, category: Category.SMALL }], // 이미 서비스가 있음
        region: [],
        driver: [],
      };

      (profileRepository.findProfileByUserId as jest.Mock).mockResolvedValue(
        mockExistingUser
      );

      // When & Then
      await expect(
        profileService.createProfile(mockUserId, mockProfile)
      ).rejects.toThrow(ApiError);

      await expect(
        profileService.createProfile(mockUserId, mockProfile)
      ).rejects.toThrow(HTTP_MESSAGE.PROFILE_ALREADY_EXISTS);

      const error = await profileService
        .createProfile(mockUserId, mockProfile)
        .catch((e) => e);
      expect(error.statusCode).toBe(HTTP_STATUS.PROFILE_ALREADY_EXISTS);
      expect(error.code).toBe(HTTP_CODE.PROFILE_ALREADY_EXISTS);
    });

    it("이미 Region이 등록되어 있으면 PROFILE_ALREADY_EXISTS 에러를 던져야 함", async () => {
      // Given
      const mockProfile = {
        serviceCategories: [Category.SMALL] as Category[],
        region: [RegionType.SEOUL] as RegionType[],
      };

      const mockExistingUser = {
        id: mockUserId,
        email: "user@test.com",
        phone_number: "01012345678",
        name: "테스트유저",
        profileImage: null,
        role: Role.USER,
        provider: "LOCAL",
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        service: [],
        region: [{ id: 1, region: RegionType.SEOUL }], // 이미 지역이 있음
        driver: [],
      };

      (
        profileRepository.findProfileByUserId as jest.Mock
      ).mockResolvedValueOnce(mockExistingUser);

      // When & Then
      await expect(
        profileService.createProfile(mockUserId, mockProfile)
      ).rejects.toThrow(HTTP_MESSAGE.PROFILE_ALREADY_EXISTS);
    });

    it("이미 Driver가 등록되어 있으면 PROFILE_ALREADY_EXISTS 에러를 던져야 함", async () => {
      // Given
      const mockProfile = {
        serviceCategories: [Category.SMALL] as Category[],
        region: [RegionType.SEOUL] as RegionType[],
        nickname: "테스트기사",
      };

      const mockExistingUser = {
        id: mockUserId,
        email: "driver@test.com",
        phone_number: "01012345678",
        name: "테스트기사",
        profileImage: null,
        role: Role.DRIVER,
        provider: "LOCAL",
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        service: [],
        region: [],
        driver: [{ id: 1, user_id: mockUserId, nickname: "기존기사" }], // 이미 드라이버가 있음
      };

      (
        profileRepository.findProfileByUserId as jest.Mock
      ).mockResolvedValueOnce(mockExistingUser);

      // When & Then
      await expect(
        profileService.createProfile(mockUserId, mockProfile)
      ).rejects.toThrow(HTTP_MESSAGE.PROFILE_ALREADY_EXISTS);
    });

    it("프로필 생성 후 조회 실패 시 INTERNAL_ERROR를 던져야 함", async () => {
      // Given
      const mockProfile = {
        serviceCategories: [Category.SMALL] as Category[],
        region: [RegionType.SEOUL] as RegionType[],
      };

      const mockExistingUser = {
        id: mockUserId,
        email: "user@test.com",
        phone_number: "01012345678",
        name: "테스트유저",
        profileImage: null,
        role: Role.USER,
        provider: "LOCAL",
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        service: [],
        region: [],
        driver: [],
      };

      // 첫 번째 호출: 기존 프로필 확인 (tx 없음)
      // 두 번째 호출: 트랜잭션 내부에서 생성 후 조회 (tx 있음)
      (profileRepository.findProfileByUserId as jest.Mock).mockImplementation(
        (userId: string, tx?: any) => {
          // tx가 있으면 트랜잭션 내부 호출 (생성 후 조회)
          if (tx) {
            return Promise.resolve(null);
          }
          // tx가 없으면 첫 번째 호출 (기존 프로필 확인)
          return Promise.resolve(mockExistingUser);
        }
      );

      (profileRepository.createServices as jest.Mock).mockResolvedValue(
        undefined
      );
      (profileRepository.createRegions as jest.Mock).mockResolvedValue(
        undefined
      );

      // When & Then
      await expect(
        profileService.createProfile(mockUserId, mockProfile)
      ).rejects.toThrow(ApiError);

      const error = await profileService
        .createProfile(mockUserId, mockProfile)
        .catch((e) => e);
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_ERROR);
      expect(error.code).toBe(HTTP_CODE.INTERNAL_ERROR);
    });
  });
});

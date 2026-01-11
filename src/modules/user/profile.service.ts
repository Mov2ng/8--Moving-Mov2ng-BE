import { Role } from "@prisma/client"; // 외부 라이브러리 / 자동 생성 타입
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../constants/http"; // 전역 상수
import ApiError from "../../core/http/ApiError"; // API 에러 클래스
import authRepository from "../auth/auth.repository"; // 다른 도메인의 repository
import { ProfileRequestDto } from "./user.dto"; // 현재 도메인의 DTO / 타입
import profileRepository from "./profile.repository"; // 현재 도메인의 repository
import prisma from "../../config/db"; // DB 직접 접근 - 트랜잭션용

/**
 * 사용자 프로필 조회
 * @param userId 사용자 ID
 * @returns 사용자 프로필
 */
async function getProfile(userId: string) {
  const user = await profileRepository.findProfileByUserId(userId);
  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.USER_NOT_FOUND,
      HTTP_CODE.USER_NOT_FOUND
    );
  }
  const { service, region: regionData, ...rest } = user;
  // profileImage는 null일 수 있음 - 프론트에서 null 체크 후 정적 이미지 표시
  return {
    ...rest,
    serviceCategories: service.map((s) => s.category),
    region: regionData.map((r) => r.region),
  };
}

/**
 * 사용자 프로필 생성
 * @param userId 사용자 ID
 * @param profile 사용자 프로필
 * @returns 생성된 사용자 프로필
 */
async function createProfile(userId: string, profile: ProfileRequestDto) {
  const {
    profileImage,
    serviceCategories,
    region,
    nickname,
    driverYears,
    driverIntro,
    driverContent,
  } = profile;

  // 프로필 중복 생성 방지: Service, Region, Driver가 이미 있으면 기존 프로필 반환
  const existingProfile = await profileRepository.findProfileByUserId(userId);
  if (!existingProfile) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.USER_NOT_FOUND,
      HTTP_CODE.USER_NOT_FOUND
    );
  }

  // 이미 프로필이 등록되어 있는지 확인
  const hasExistingProfile =
    existingProfile.service.length > 0 ||
    existingProfile.region.length > 0 ||
    existingProfile.driver.length > 0;

  if (hasExistingProfile) {
    // TODO: updateProfile 구현 시, 여기서 updateProfile을 호출하도록 변경
    // 현재는 역할 분리를 위해 에러 반환 (프론트에서 PUT /user/profile 사용하도록 안내)
    throw new ApiError(
      HTTP_STATUS.PROFILE_ALREADY_EXISTS,
      HTTP_MESSAGE.PROFILE_ALREADY_EXISTS,
      HTTP_CODE.PROFILE_ALREADY_EXISTS
    );
  }

  return await prisma.$transaction(async (tx) => {
    // 1. profileImage 업데이트 (값이 있을 때만)
    if (profileImage !== undefined) {
      await authRepository.updateUser(userId, { profileImage }, tx);
    }

    // 2. Service 생성
    if (serviceCategories && serviceCategories.length > 0) {
      // validator에서 이미 Category enum으로 검증되었으므로 타입 단언 불필요
      await profileRepository.createServices(
        serviceCategories.map((category) => ({
          user_id: userId,
          category,
        })),
        tx
      );
    }

    // 3. Region 생성
    if (region && region.length > 0) {
      // validator에서 이미 RegionType enum으로 검증되었으므로 타입 단언 불필요
      await profileRepository.createRegions(
        region.map((regionValue) => ({
          user_id: userId,
          region: regionValue,
        })),
        tx
      );
    }

    // 4. DRIVER인 경우 Driver 정보 저장: validator에서 nickname 필수 검증 완료
    if (existingProfile.role === Role.DRIVER) {
      await profileRepository.createDriver(
        {
          user_id: userId,
          nickname: nickname!, // 값 단언 가능
          driver_years: driverYears,
          driver_intro: driverIntro,
          driver_content: driverContent,
        },
        tx
      );
    }

    // 생성된 프로필 데이터 반환
    const createdProfile = await profileRepository.findProfileByUserId(
      userId,
      tx
    );
    if (!createdProfile) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_ERROR,
        HTTP_MESSAGE.INTERNAL_ERROR,
        HTTP_CODE.INTERNAL_ERROR
      );
    }
    const { service, region: regionData, ...rest } = createdProfile;
    return {
      ...rest,
      serviceCategories: service.map((s) => s.category),
      region: regionData.map((r) => r.region),
    };
  });
}

/**
 * 사용자 프로필 업데이트
 * @param userId 사용자 ID
 * @param profile 사용자 프로필
 * @returns 업데이트된 사용자 프로필
 */
async function updateProfile(
  userId: string,
  profile: ProfileRequestDto
): Promise<{
  id: string;
  email: string;
  phone_number: string;
  name: string;
  profileImage: string | null;
  role: Role;
  provider: string;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
  serviceCategories: string[];
  region: string[];
}> {
  const {
    profileImage,
    serviceCategories,
    region,
    nickname,
    driverYears,
    driverIntro,
    driverContent,
  } = profile;

  // 기존 프로필 조회
  const existingProfile = await profileRepository.findProfileByUserId(userId);
  if (!existingProfile) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.USER_NOT_FOUND,
      HTTP_CODE.USER_NOT_FOUND
    );
  }

  return await prisma.$transaction(async (tx) => {
    // 1. profileImage 업데이트 (값이 있을 때만)
    if (profileImage !== undefined) {
      await authRepository.updateUser(userId, { profileImage }, tx);
    }

    // 2. Service 업데이트 (기존 삭제 후 새로 생성)
    if (serviceCategories !== undefined) {
      // 기존 Service 삭제 (soft delete)
      await profileRepository.updateServicesByUserId(
        userId,
        { isDelete: true },
        tx
      );
      // 새 Service 생성
      if (serviceCategories.length > 0) {
        await profileRepository.createServices(
          serviceCategories.map((category) => ({
            user_id: userId,
            category,
          })),
          tx
        );
      }
    }

    // 3. Region 업데이트 (기존 삭제 후 새로 생성)
    if (region !== undefined) {
      // 기존 Region 삭제 (soft delete)
      await profileRepository.updateRegionsByUserId(
        userId,
        { isDelete: true },
        tx
      );
      // 새 Region 생성
      if (region.length > 0) {
        await profileRepository.createRegions(
          region.map((regionValue) => ({
            user_id: userId,
            region: regionValue,
          })),
          tx
        );
      }
    }

    // 4. DRIVER인 경우 Driver 정보 업데이트
    if (existingProfile.role === Role.DRIVER) {
      const existingDriver = await profileRepository.findDriverByUserId(
        userId,
        tx
      );
      if (existingDriver) {
        await profileRepository.updateDriverByUserId(
          { id: existingDriver.id },
          {
            nickname: nickname,
            driver_years: driverYears,
            driver_intro: driverIntro,
            driver_content: driverContent,
          },
          tx
        );
      } else {
        // Driver가 없으면 생성
        await profileRepository.createDriver(
          {
            user_id: userId,
            nickname: nickname!,
            driver_years: driverYears,
            driver_intro: driverIntro,
            driver_content: driverContent,
          },
          tx
        );
      }
    }

    // 업데이트된 프로필 데이터 반환
    const updatedProfile = await profileRepository.findProfileByUserId(
      userId,
      tx
    );
    if (!updatedProfile) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_ERROR,
        HTTP_MESSAGE.INTERNAL_ERROR,
        HTTP_CODE.INTERNAL_ERROR
      );
    }
    const { service, region: regionData, ...rest } = updatedProfile;
    return {
      ...rest,
      serviceCategories: service.map((s) => s.category),
      region: regionData.map((r) => r.region),
    };
  });
}

export default {
  getProfile,
  createProfile,
  updateProfile,
};

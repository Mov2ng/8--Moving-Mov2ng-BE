import { Role, Prisma } from "@prisma/client"; // 외부 라이브러리 / 자동 생성 타입
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../constants/http";
import ApiError from "../../core/http/ApiError";
import { hashPassword, verifyPassword } from "../../core/security/password";
import authRepository from "../auth/auth.repository";
import {
  ProfileRequestDto,
  UserIntegrationRequestDto,
  DriverProfileRequestDto,
} from "./profile.dto"; // 현재 도메인의 DTO / 타입
import profileRepository from "./profile.repository";
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
  const { service, region: regionData, driver, phone_number, ...rest } = user;
  const driverData = driver.length > 0 ? driver[0] : null;
  // profileImage는 null일 수 있음 - 프론트에서 null 체크 후 정적 이미지 표시
  return {
    ...rest,
    phoneNum: phone_number,
    serviceCategories: service.map((s) => s.category),
    region: regionData.map((r) => r.region),
    nickname: driverData?.nickname ?? null,
    driverYears: driverData?.driver_years ?? null,
    driverIntro: driverData?.driver_intro ?? null,
    driverContent: driverData?.driver_content ?? null,
  };
}

/**
 * 사용자 프로필 생성
 * @param userId 사용자 ID
 * @param profile 사용자 프로필
 * @returns 생성된 사용자 프로필
 */
async function createProfile(userId: string, profile: ProfileRequestDto) {
  const { profileImage, serviceCategories, region } = profile;

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

    // 4. DRIVER인 경우 Driver 정보 저장
    if (existingProfile.role === Role.DRIVER) {
      const driverProfile = profile as DriverProfileRequestDto;
      await profileRepository.createDriver(
        {
          user_id: userId,
          nickname: driverProfile.nickname!,
          driver_years: driverProfile.driverYears,
          driver_intro: driverProfile.driverIntro,
          driver_content: driverProfile.driverContent,
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
    const {
      service,
      region: regionData,
      driver,
      phone_number,
      ...rest
    } = createdProfile;
    const driverData = driver.length > 0 ? driver[0] : null;
    return {
      ...rest,
      phoneNum: phone_number,
      serviceCategories: service.map((s) => s.category),
      region: regionData.map((r) => r.region),
      nickname: driverData?.nickname ?? null,
      driverYears: driverData?.driver_years ?? null,
      driverIntro: driverData?.driver_intro ?? null,
      driverContent: driverData?.driver_content ?? null,
    };
  });
}

/**
 * 기사님 프로필 업데이트
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
  phoneNum: string;
  name: string;
  profileImage: string | null;
  role: Role;
  provider: string;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
  serviceCategories: string[];
  region: string[];
  nickname: string | null;
  driverYears: number | null;
  driverIntro: string | null;
  driverContent: string | null;
}> {
  const { profileImage, serviceCategories, region } = profile;

  // 기존 프로필 조회
  const existingProfile = await profileRepository.findProfileByUserId(userId);
  if (!existingProfile) {
    throw new ApiError(
      HTTP_STATUS.PROFILE_NOT_FOUND,
      HTTP_MESSAGE.PROFILE_NOT_FOUND,
      HTTP_CODE.PROFILE_NOT_FOUND
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
      const driverProfile = profile as DriverProfileRequestDto;
      const existingDriver = await profileRepository.findDriverByUserId(
        userId,
        tx
      );
      if (existingDriver) {
        await profileRepository.updateDriverByUserId(
          { id: existingDriver.id },
          {
            nickname: driverProfile.nickname,
            driver_years: driverProfile.driverYears,
            driver_intro: driverProfile.driverIntro,
            driver_content: driverProfile.driverContent,
          },
          tx
        );
      } else {
        // Driver가 없으면 생성
        await profileRepository.createDriver(
          {
            user_id: userId,
            nickname: driverProfile.nickname!,
            driver_years: driverProfile.driverYears,
            driver_intro: driverProfile.driverIntro,
            driver_content: driverProfile.driverContent,
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
    const {
      service,
      region: regionData,
      driver,
      phone_number,
      ...rest
    } = updatedProfile;
    const driverData = driver.length > 0 ? driver[0] : null;
    return {
      ...rest,
      phoneNum: phone_number,
      serviceCategories: service.map((s) => s.category),
      region: regionData.map((r) => r.region),
      nickname: driverData?.nickname ?? null,
      driverYears: driverData?.driver_years ?? null,
      driverIntro: driverData?.driver_intro ?? null,
      driverContent: driverData?.driver_content ?? null,
    };
  });
}

/**
 * 기사님 기본정보 업데이트
 * @param userId 사용자 ID
 * @param basicInfo 기본정보 (이름, 전화번호, 비밀번호)
 * @returns 업데이트된 사용자 정보
 */
async function updateBasicInfo(
  userId: string,
  basicInfo: {
    name?: string;
    phoneNum?: string;
    currentPassword?: string;
    newPassword?: string;
    newPasswordConfirm?: string;
  }
) {
  const { name, phoneNum, currentPassword, newPassword } = basicInfo;

  // 기존 사용자 정보 조회
  const existingUser = await authRepository.findUserById(userId);
  if (!existingUser) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.USER_NOT_FOUND,
      HTTP_CODE.USER_NOT_FOUND
    );
  }

  return await prisma.$transaction(async (tx) => {
    // Prisma.UserUpdateInput: 사용자 정보 업데이트 시 사용되는 타입 (부분 업데이트 가능)
    const updateData: Prisma.UserUpdateInput = {};

    // 1. 이름 업데이트
    if (name !== undefined) {
      updateData.name = name;
    }

    // 2. 전화번호 업데이트
    if (phoneNum !== undefined) {
      updateData.phone_number = phoneNum;
    }

    // 3. 비밀번호 변경
    if (currentPassword && newPassword) {
      // 현재 비밀번호 검증
      const isPasswordValid = await verifyPassword(
        currentPassword,
        existingUser.password
      );
      if (!isPasswordValid) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "현재 비밀번호가 일치하지 않습니다.",
          HTTP_CODE.UNAUTHORIZED
        );
      }

      // 새 비밀번호 해싱
      const hashedPassword = await hashPassword(newPassword);
      if (!hashedPassword) {
        throw new ApiError(
          HTTP_STATUS.INTERNAL_ERROR,
          "비밀번호 해싱에 실패했습니다.",
          HTTP_CODE.INTERNAL_ERROR
        );
      }
      updateData.password = hashedPassword;
    }

    // 업데이트 실행
    if (Object.keys(updateData).length > 0) {
      await authRepository.updateUser(userId, updateData, tx);
    }

    // 업데이트된 사용자 정보 반환
    const updatedUser = await authRepository.findUserById(userId, tx);
    if (!updatedUser) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_ERROR,
        HTTP_MESSAGE.INTERNAL_ERROR,
        HTTP_CODE.INTERNAL_ERROR
      );
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  });
}

/**
 * 일반 회원 프로필 + 기본정보 업데이트
 * @param userId 사용자 ID
 * @param userIntegration 사용자 프로필 + 기본정보
 * @returns 업데이트된 사용자 프로필 + 기본정보
 */
async function updateUserIntegration(
  userId: string,
  userIntegration: UserIntegrationRequestDto
) {
  const {
    profileImage,
    serviceCategories,
    region,
    name,
    phoneNum,
    currentPassword,
    newPassword,
  } = userIntegration;

  // 기존 프로필 조회
  const existingProfile = await profileRepository.findProfileByUserId(userId);
  if (!existingProfile) {
    throw new ApiError(
      HTTP_STATUS.PROFILE_NOT_FOUND,
      HTTP_MESSAGE.PROFILE_NOT_FOUND,
      HTTP_CODE.PROFILE_NOT_FOUND
    );
  }

  return await prisma.$transaction(async (tx) => {
    // Prisma.UserUpdateInput: 사용자 정보 업데이트 시 사용되는 타입 (부분 업데이트 가능)
    const updateData: Prisma.UserUpdateInput = {};

    // 기본정보 업데이트: 이름
    if (name !== undefined) {
      updateData.name = name;
    }

    // 기본정보 업데이트: 전화번호
    if (phoneNum !== undefined) {
      updateData.phone_number = phoneNum;
    }

    // 기본정보 업데이트: 프로필 이미지
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    // 기본정보 업데이트: 비밀번호 변경
    if (currentPassword && newPassword) {
      // 비밀번호 검증을 위해 사용자 정보 조회
      const existingUser = await authRepository.findUserById(userId, tx);
      if (!existingUser) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          HTTP_MESSAGE.USER_NOT_FOUND,
          HTTP_CODE.USER_NOT_FOUND
        );
      }
      // 현재 비밀번호 검증
      const isPasswordValid = await verifyPassword(
        currentPassword,
        existingUser.password
      );
      if (!isPasswordValid) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "현재 비밀번호가 일치하지 않습니다.",
          HTTP_CODE.UNAUTHORIZED
        );
      }

      // 새 비밀번호 해싱
      const hashedPassword = await hashPassword(newPassword);
      if (!hashedPassword) {
        throw new ApiError(
          HTTP_STATUS.INTERNAL_ERROR,
          "비밀번호 해싱에 실패했습니다.",
          HTTP_CODE.INTERNAL_ERROR
        );
      }
      updateData.password = hashedPassword;
    }

    // 1. User 업데이트
    if (Object.keys(updateData).length > 0) {
      await authRepository.updateUser(userId, updateData, tx);
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
    const {
      service,
      region: regionData,
      driver,
      phone_number,
      password: _,
      ...rest
    } = updatedProfile;
    const driverData = driver.length > 0 ? driver[0] : null;
    return {
      ...rest,
      phoneNum: phone_number,
      serviceCategories: service.map((s) => s.category),
      region: regionData.map((r) => r.region),
      nickname: driverData?.nickname ?? null,
      driverYears: driverData?.driver_years ?? null,
      driverIntro: driverData?.driver_intro ?? null,
      driverContent: driverData?.driver_content ?? null,
    };
  });
}

export default {
  getProfile,
  createProfile,
  updateProfile,
  updateBasicInfo,
  updateUserIntegration,
};

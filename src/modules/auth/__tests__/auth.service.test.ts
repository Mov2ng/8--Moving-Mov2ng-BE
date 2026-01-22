import { Request, Response } from "express";
import { Role } from "@prisma/client";
import authService from "../auth.service";
import authRepository from "../auth.repository";
import ApiError from "../../../core/http/ApiError";
import { HTTP_STATUS, HTTP_CODE } from "../../../constants/http";
import * as passwordUtils from "../../../core/security/password";
import * as jwtUtils from "../../../utils/jwt";

// 모듈 모킹
jest.mock("../auth.repository");
jest.mock("../../../core/security/password");
jest.mock("../../../utils/jwt");
 
describe("AuthService", () => {
  // 테스트 격리를 위한 mock 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========== signup 테스트 ==========
  describe("signup", () => {
    const mockUserData = {
      name: "테스트유저",
      email: "test@example.com",
      phoneNum: "01012345678",
      password: "password123!",
      role: "USER" as const,
    };

    describe("성공 케이스", () => {
      it("새로운 사용자를 성공적으로 등록해야 함", async () => {
        // Given
        const mockHashedPassword = "hashed_password_123";
        const mockCreatedUser = {
          id: "user-id-123",
          ...mockUserData,
          password: mockHashedPassword,
          role: Role.USER,
          provider: "LOCAL",
          isDelete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Given: 중복 체크 - 사용자 없음
        (authRepository.findUserByEmailAndRole as jest.Mock).mockResolvedValue(
          null
        );

        // Given: 비밀번호 해싱 모킹
        (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(
          mockHashedPassword
        );

        // Given: 사용자 생성 모킹
        (authRepository.createUser as jest.Mock).mockResolvedValue(
          mockCreatedUser
        );

        // When
        const result = await authService.signup(
          mockUserData.name,
          mockUserData.email,
          mockUserData.phoneNum,
          mockUserData.password,
          mockUserData.role
        );

        // Then
        expect(result).toEqual(mockCreatedUser);
        expect(authRepository.findUserByEmailAndRole).toHaveBeenCalledWith(
          mockUserData.email,
          Role.USER
        );
        expect(passwordUtils.hashPassword).toHaveBeenCalledWith(
          mockUserData.password
        );
        expect(authRepository.createUser).toHaveBeenCalledWith(
          mockUserData.name,
          mockUserData.email,
          mockUserData.phoneNum,
          mockHashedPassword,
          Role.USER
        );
      });

      it("DRIVER 역할로 사용자를 등록할 수 있어야 함", async () => {
        // Given
        const driverData = {
          ...mockUserData,
          role: "DRIVER" as const,
        };
        const mockHashedPassword = "hashed_password_123";
        const mockCreatedDriver = {
          id: "driver-id-123",
          ...driverData,
          password: mockHashedPassword,
          role: Role.DRIVER,
          provider: "LOCAL",
          isDelete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (authRepository.findUserByEmailAndRole as jest.Mock).mockResolvedValue(
          null
        );
        (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(
          mockHashedPassword
        );
        (authRepository.createUser as jest.Mock).mockResolvedValue(
          mockCreatedDriver
        );

        // When
        const result = await authService.signup(
          driverData.name,
          driverData.email,
          driverData.phoneNum,
          driverData.password,
          driverData.role
        );

        // Then
        expect(result).toEqual(mockCreatedDriver);
        expect(authRepository.createUser).toHaveBeenCalledWith(
          driverData.name,
          driverData.email,
          driverData.phoneNum,
          mockHashedPassword,
          Role.DRIVER
        );
      });
    });

    describe("실패 케이스", () => {
      it("이미 존재하는 이메일과 역할이면 BAD_REQUEST 에러를 던져야 함", async () => {
        // Given
        const existingUser = {
          id: "existing-user-id",
          email: mockUserData.email,
          role: Role.USER,
          name: "기존유저",
          phone_number: "01000000000",
          password: "hashed",
          provider: "LOCAL",
          isDelete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (authRepository.findUserByEmailAndRole as jest.Mock).mockResolvedValue(
          existingUser
        );

        // When & Then
        await expect(
          authService.signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
        ).rejects.toThrow(ApiError);

        await expect(
          authService.signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
        ).rejects.toThrow("이미 가입한 이메일입니다.");

        const error = await authService
          .signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
        expect(error.code).toBe(HTTP_CODE.BAD_REQUEST);
      });

      it("이미 존재하는 전화번호와 역할이면 BAD_REQUEST 에러를 던져야 함", async () => {
        // Given
        const existingUser = {
          id: "existing-user-id",
          email: "different@example.com", // 다른 이메일
          role: Role.USER,
          name: "기존유저",
          phone_number: mockUserData.phoneNum, // 같은 전화번호
          password: "hashed",
          provider: "LOCAL",
          isDelete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // 이메일 중복 체크는 통과 (null 반환)
        (authRepository.findUserByEmailAndRole as jest.Mock).mockResolvedValue(
          null
        );
        // 전화번호 중복 체크는 실패 (기존 유저 반환)
        (authRepository.findUserByPhoneNumAndRole as jest.Mock).mockResolvedValue(
          existingUser
        );

        // When & Then
        await expect(
          authService.signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
        ).rejects.toThrow(ApiError);

        await expect(
          authService.signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
        ).rejects.toThrow("이미 가입한 전화번호입니다.");

        const error = await authService
          .signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
        expect(error.code).toBe(HTTP_CODE.BAD_REQUEST);
      });

      it("비밀번호 해싱 실패 시 INTERNAL_ERROR를 던져야 함", async () => {
        // Given
        (authRepository.findUserByEmailAndRole as jest.Mock).mockResolvedValue(
          null
        );
        (authRepository.findUserByPhoneNumAndRole as jest.Mock).mockResolvedValue(
          null
        );
        (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(null);

        // When & Then
        await expect(
          authService.signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
        ).rejects.toThrow(ApiError);

        const error = await authService
          .signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_ERROR);
        expect(error.code).toBe(HTTP_CODE.INTERNAL_ERROR);
        expect(error.message).toBe("비밀번호 해싱에 실패했습니다.");
      });

      it("사용자 생성 실패 시 INTERNAL_ERROR를 던져야 함", async () => {
        // Given
        const mockHashedPassword = "hashed_password_123";

        (authRepository.findUserByEmailAndRole as jest.Mock).mockResolvedValue(
          null
        );
        (authRepository.findUserByPhoneNumAndRole as jest.Mock).mockResolvedValue(
          null
        );
        (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(
          mockHashedPassword
        );
        (authRepository.createUser as jest.Mock).mockResolvedValue(null);

        // When & Then
        await expect(
          authService.signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
        ).rejects.toThrow(ApiError);

        const error = await authService
          .signup(
            mockUserData.name,
            mockUserData.email,
            mockUserData.phoneNum,
            mockUserData.password,
            mockUserData.role
          )
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_ERROR);
        expect(error.code).toBe(HTTP_CODE.INTERNAL_ERROR);
        expect(error.message).toBe("사용자 생성에 실패했습니다.");
      });
    });
  });

  // ========== login 테스트 ==========
  describe("login", () => {
    const mockLoginData = {
      email: "test@example.com",
      password: "password123!",
      role: "USER" as const,
    };

    const mockRes = {
      cookie: jest.fn(),
    } as unknown as Response;

    const mockReq = {
      headers: {},
    } as unknown as Request;

    describe("성공 케이스", () => {
      it("올바른 이메일과 비밀번호로 로그인해야 함", async () => {
        // Given
        const mockUser = {
          id: "user-id-123",
          email: mockLoginData.email,
          password: "hashed_password_123",
          name: "테스트유저",
          phone_number: "01012345678",
          role: Role.USER,
          provider: "LOCAL",
          isDelete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockAccessToken = "access_token_123";
        const mockRefreshToken = "refresh_token_123";

        (authRepository.findUserByEmailAndRole as jest.Mock).mockResolvedValue(
          mockUser
        );
        (passwordUtils.verifyPassword as jest.Mock).mockResolvedValue(true);
        (jwtUtils.generateToken as jest.Mock).mockReturnValue(mockAccessToken);
        (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue(
          mockRefreshToken
        );

        // When
        const result = await authService.login(
          mockLoginData.email,
          mockLoginData.password,
          mockRes,
          mockReq,
          mockLoginData.role
        );

        // Then
        expect(result).toMatchObject({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          phone_number: mockUser.phone_number,
          role: mockUser.role,
          accessToken: mockAccessToken,
        });
        expect("password" in result).toBe(false); // password가 제외되었는지 확인
        expect(authRepository.findUserByEmailAndRole).toHaveBeenCalledWith(
          mockLoginData.email,
          Role.USER
        );
        expect(passwordUtils.verifyPassword).toHaveBeenCalledWith(
          mockLoginData.password,
          mockUser.password
        );
        expect(jwtUtils.generateToken).toHaveBeenCalledWith({ id: mockUser.id });
        expect(jwtUtils.generateRefreshToken).toHaveBeenCalledWith({
          id: mockUser.id,
        });
        expect(mockRes.cookie).toHaveBeenCalledWith(
          "refreshToken",
          mockRefreshToken,
          expect.any(Object)
        );
      });
    });

    describe("실패 케이스", () => {
      it("존재하지 않는 사용자면 NOT_FOUND 에러를 던져야 함", async () => {
        // Given
        (authRepository.findUserByEmailAndRole as jest.Mock).mockResolvedValue(
          null
        );

        // When & Then
        await expect(
          authService.login(
            mockLoginData.email,
            mockLoginData.password,
            mockRes,
            mockReq,
            mockLoginData.role
          )
        ).rejects.toThrow(ApiError);

        const error = await authService
          .login(
            mockLoginData.email,
            mockLoginData.password,
            mockRes,
            mockReq,
            mockLoginData.role
          )
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
        expect(error.code).toBe(HTTP_CODE.NOT_FOUND);
        expect(error.message).toBe("사용자 정보를 찾을 수 없습니다.");
      });

      it("잘못된 비밀번호면 UNAUTHORIZED 에러를 던져야 함", async () => {
        // Given
        const mockUser = {
          id: "user-id-123",
          email: mockLoginData.email,
          password: "hashed_password_123",
          name: "테스트유저",
          phone_number: "01012345678",
          role: Role.USER,
          provider: "LOCAL",
          isDelete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (authRepository.findUserByEmailAndRole as jest.Mock).mockResolvedValue(
          mockUser
        );
        (passwordUtils.verifyPassword as jest.Mock).mockResolvedValue(false);

        // When & Then
        await expect(
          authService.login(
            mockLoginData.email,
            mockLoginData.password,
            mockRes,
            mockReq,
            mockLoginData.role
          )
        ).rejects.toThrow(ApiError);

        const error = await authService
          .login(
            mockLoginData.email,
            mockLoginData.password,
            mockRes,
            mockReq,
            mockLoginData.role
          )
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
        expect(error.code).toBe(HTTP_CODE.UNAUTHORIZED);
        expect(error.message).toBe(
          "이메일 또는 비밀번호가 일치하지 않습니다."
        );
      });
    });
  });

  // ========== logout 테스트 ==========
  describe("logout", () => {
    const mockRes = {
      clearCookie: jest.fn(),
    } as unknown as Response;

    const mockReq = {
      headers: {},
    } as unknown as Request;

    it("쿠키를 삭제해야 함", async () => {
      // When
      await authService.logout(mockRes, mockReq);

      // Then
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object)
      );
    });

    it("req 없이도 쿠키를 삭제할 수 있어야 함", async () => {
      // When
      await authService.logout(mockRes);

      // Then
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object)
      );
    });
  });

  // ========== refresh 테스트 ==========
  describe("refresh", () => {
    const mockRefreshToken = "valid_refresh_token";
    const mockRes = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;

    const mockReq = {
      headers: {},
    } as unknown as Request;

    describe("성공 케이스", () => {
      it("유효한 refreshToken으로 새로운 토큰을 생성해야 함", async () => {
        // Given
        const mockDecoded = { id: "user-id-123" };
        const mockUser = {
          id: "user-id-123",
          email: "test@example.com",
          name: "테스트유저",
          phone_number: "01012345678",
          role: Role.USER,
          provider: "LOCAL",
          isDelete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockNewAccessToken = "new_access_token_123";
        const mockNewRefreshToken = "new_refresh_token_123";

        (jwtUtils.verifyToken as jest.Mock).mockReturnValue(mockDecoded);
        (authRepository.findUserById as jest.Mock).mockResolvedValue(mockUser);
        (jwtUtils.generateToken as jest.Mock).mockReturnValue(
          mockNewAccessToken
        );
        (jwtUtils.generateRefreshToken as jest.Mock).mockReturnValue(
          mockNewRefreshToken
        );

        // When
        const result = await authService.refresh(mockRefreshToken, mockRes, mockReq);

        // Then
        expect(result).toEqual({ accessToken: mockNewAccessToken });
        expect(jwtUtils.verifyToken).toHaveBeenCalledWith(mockRefreshToken);
        expect(authRepository.findUserById).toHaveBeenCalledWith(
          mockDecoded.id
        );
        expect(jwtUtils.generateToken).toHaveBeenCalledWith({
          id: mockUser.id,
        });
        expect(jwtUtils.generateRefreshToken).toHaveBeenCalledWith({
          id: mockUser.id,
        });
        expect(mockRes.cookie).toHaveBeenCalledWith(
          "refreshToken",
          mockNewRefreshToken,
          expect.any(Object)
        );
      });
    });

    describe("실패 케이스", () => {
      it("유효하지 않은 refreshToken이면 에러를 던지고 쿠키를 삭제해야 함", async () => {
        // Given
        const mockError = new ApiError(
          HTTP_STATUS.AUTH_INVALID_TOKEN,
          "토큰이 만료되었습니다.",
          HTTP_CODE.AUTH_INVALID_TOKEN
        );

        (jwtUtils.verifyToken as jest.Mock).mockImplementation(() => {
          throw mockError;
        });

        // When & Then
        await expect(
          authService.refresh(mockRefreshToken, mockRes, mockReq)
        ).rejects.toThrow(ApiError);

        expect(mockRes.clearCookie).toHaveBeenCalledWith(
          "refreshToken",
          expect.any(Object)
        );
      });

      it("decoded에 id가 없으면 UNAUTHORIZED 에러를 던져야 함", async () => {
        // Given
        (jwtUtils.verifyToken as jest.Mock).mockReturnValue("invalid_decoded");

        // When & Then
        await expect(
          authService.refresh(mockRefreshToken, mockRes, mockReq)
        ).rejects.toThrow(ApiError);

        const error = await authService
          .refresh(mockRefreshToken, mockRes, mockReq)
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
        expect(error.code).toBe(HTTP_CODE.UNAUTHORIZED);
        expect(mockRes.clearCookie).toHaveBeenCalled();
      });

      it("사용자가 존재하지 않으면 NOT_FOUND 에러를 던져야 함", async () => {
        // Given
        const mockDecoded = { id: "non-existent-user-id" };

        (jwtUtils.verifyToken as jest.Mock).mockReturnValue(mockDecoded);
        (authRepository.findUserById as jest.Mock).mockResolvedValue(null);

        // When & Then
        await expect(
          authService.refresh(mockRefreshToken, mockRes, mockReq)
        ).rejects.toThrow(ApiError);

        const error = await authService
          .refresh(mockRefreshToken, mockRes, mockReq)
          .catch((e) => e);

        expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
        expect(error.code).toBe(HTTP_CODE.NOT_FOUND);
        expect(error.message).toBe(
          "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요."
        );
        expect(mockRes.clearCookie).toHaveBeenCalled();
      });
    });
  });
});


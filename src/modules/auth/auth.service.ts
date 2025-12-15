import { JwtPayload } from "jsonwebtoken";
import { HTTP_CODE, HTTP_STATUS } from "../../constants/http";
import ApiError from "../../core/http/ApiError";
import { hashPassword, verifyPassword } from "../../core/security/password";
import {
  generateRefreshToken,
  generateToken,
  verifyToken,
} from "../../utils/jwt";
import authRepository from "./auth.repository";


async function signup(
  name: string,
  email: string,
  phoneNum: string,
  password: string
) {
  // 이메일 중복 체크
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "이미 존재하는 이메일입니다.",
      HTTP_CODE.BAD_REQUEST
    );
  }

  // 비밀번호 해싱
  const hashedPassword = await hashPassword(password);
  if (!hashedPassword) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_ERROR,
      "비밀번호 해싱에 실패했습니다.",
      HTTP_CODE.INTERNAL_ERROR
    );
  }

  // DB에 사용자 정보 저장
  const user = await authRepository.createUser(
    name,
    email,
    phoneNum,
    hashedPassword
  );
  if (!user) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_ERROR,
      "사용자 생성에 실패했습니다.",
      HTTP_CODE.INTERNAL_ERROR
    );
  }
  return user;
}

async function login(email: string, password: string) {
  // 사용자 정보 조회
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "사용자 정보를 찾을 수 없습니다.",
      HTTP_CODE.NOT_FOUND
    );
  }

  // 비밀번호 검증
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "이메일 또는 비밀번호가 일치하지 않습니다.",
      HTTP_CODE.UNAUTHORIZED
    );
  }

  const accessToken = generateToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });

  const { password: _, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, accessToken, refreshToken };
}

async function logout(refreshToken: string) {
  const decoded: JwtPayload = verifyToken(refreshToken);
  if (!decoded) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "리프레시 토큰이 유효하지 않습니다.",
      HTTP_CODE.UNAUTHORIZED
    );
  }
  await authRepository.updateUser(decoded.id, { refreshToken: null });
}

export default {
  signup,
  login,
  logout,
};

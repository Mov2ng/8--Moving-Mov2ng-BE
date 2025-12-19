import prisma from "../../config/db";
import { hashPassword } from "../../core/security/password";

/**
 * 사용자 정보 생성
 * @param name 사용자 이름
 * @param email 사용자 이메일
 * @param phoneNum 사용자 전화번호
 * @param password 사용자 비밀번호
 */
async function createUser(
  name: string,
  email: string,
  phoneNum: string,
  password: string
) {
  return prisma.user.create({
    data: {
      name,
      email,
      phone_number: phoneNum,
      password: await hashPassword(password),
    },
  });
}

/**
 * 사용자 이메일로 사용자 정보 조회
 * @param email 사용자 이메일
 * @returns 사용자 정보
 */
function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

/**
 * 사용자 정보 업데이트
 * @param id 사용자 ID
 * @param name 사용자 이름
 * @param email 사용자 이메일
 * @param phoneNum 사용자 전화번호
 * @param password 사용자 비밀번호
 */
function updateUser(
  id: string,
  name: string,
  email: string,
  phoneNum: string,
  password: string
) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
      email,
      phone_number: phoneNum,
      password,
    },
  });
}

export default {
  createUser,
  findUserByEmail,
  updateUser,
};

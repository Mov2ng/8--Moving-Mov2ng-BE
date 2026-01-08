import prisma from "../../config/db";
import { Prisma, Role, User } from "@prisma/client";

/**
 * 사용자 정보 생성
 * @param name 사용자 이름
 * @param email 사용자 이메일
 * @param phoneNum 사용자 전화번호
 * @param hashedPassword 이미 해싱된 비밀번호
 * @param role 사용자 역할
 * @param tx 트랜잭션 클라이언트
 */
async function createUser(
  name: string,
  email: string,
  phoneNum: string,
  hashedPassword: string,
  role: Role,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.user.create({
    data: {
      name,
      email,
      phone_number: phoneNum,
      password: hashedPassword,
      role,
    },
  });
}

/**
 * 사용자 ID로 사용자 정보 조회
 * @param id 사용자 ID
 * @param tx 트랜잭션 클라이언트
 * @returns 사용자 정보
 */
function findUserById(id: string, tx: Prisma.TransactionClient = prisma) {
  return tx.user.findUnique({
    where: { id },
  });
}

/**
 * 사용자 이메일로 사용자 정보 조회
 * @param email 사용자 이메일
 * @param role 사용자 역할
 * @param tx 트랜잭션 클라이언트
 * @returns 사용자 정보
 */
function findUserByEmailAndRole(
  email: string,
  role: Role,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.user.findFirst({
    where: {
      email,
      role,
    },
  });
}

/**
 * 사용자 정보 업데이트
 * @param id 사용자 ID
 * @param data 사용자 정보
 * @param tx 트랜잭션 클라이언트
 */
function updateUser(
  id: string,
  data: Prisma.UserUpdateInput,
  tx: Prisma.TransactionClient = prisma
): Promise<User> {
  return tx.user.update({
    where: { id },
    data,
  });
}
export default {
  createUser,
  findUserById,
  findUserByEmailAndRole,
  updateUser,
};

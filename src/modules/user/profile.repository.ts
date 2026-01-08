import { Prisma } from "@prisma/client";
import prisma from "../../config/db";

// 프로필 정보 조회
function findProfileByUserId(
  userId: string,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.user.findUnique({
    where: { id: userId },
    include: {
      driver: { where: { isDelete: false } },
      service: { where: { isDelete: false } },
      region: { where: { isDelete: false } },
    },
  });
}

// Driver 조회 (user_id로)
function findDriverByUserId(
  userId: string,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.driver.findFirst({
    where: { user_id: userId, isDelete: false },
  });
}

// Driver 생성
function createDriver(
  data: Prisma.DriverUncheckedCreateInput,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.driver.create({ data });
}

// Driver 업데이트
function updateDriverByUserId(
  where: Prisma.DriverWhereUniqueInput,
  data: Prisma.DriverUpdateInput,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.driver.update({ where, data });
}

// Service 일괄 업데이트 (user_id로)
function updateServicesByUserId(
  userId: string,
  data: Prisma.ServiceUpdateInput,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.service.updateMany({
    where: { user_id: userId, isDelete: false },
    data,
  });
}

// Service 조회 (user_id로, 하나라도 있는지 확인)
function findServiceByUserId(
  userId: string,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.service.findFirst({
    where: { user_id: userId, isDelete: false },
  });
}

// Service 일괄 생성
function createServices(
  data: Prisma.ServiceCreateManyInput[],
  tx: Prisma.TransactionClient = prisma
) {
  if (data.length === 0) return;
  return tx.service.createMany({ data });
}

// Region 일괄 업데이트 (user_id로)
function updateRegionsByUserId(
  userId: string,
  data: Prisma.RegionUpdateInput,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.region.updateMany({
    where: { user_id: userId, isDelete: false },
    data,
  });
}

// Region 조회 (user_id로, 하나라도 있는지 확인)
function findRegionByUserId(
  userId: string,
  tx: Prisma.TransactionClient = prisma
) {
  return tx.region.findFirst({
    where: { user_id: userId, isDelete: false },
  });
}

// Region 일괄 생성
function createRegions(
  data: Prisma.RegionCreateManyInput[],
  tx: Prisma.TransactionClient = prisma
) {
  if (data.length === 0) return;
  return tx.region.createMany({ data });
}

export default {
  findProfileByUserId,
  findDriverByUserId,
  createDriver,
  updateDriverByUserId,
  findServiceByUserId,
  updateServicesByUserId,
  createServices,
  findRegionByUserId,
  updateRegionsByUserId,
  createRegions,
};

import { Prisma } from "@prisma/client";
import prisma from "../../config/db";

// 프로필 정보 조회
function findProfileByUserId(
  tx: Prisma.TransactionClient = prisma,
  userId: string
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
  tx: Prisma.TransactionClient = prisma,
  userId: string
) {
  return tx.driver.findFirst({
    where: { user_id: userId, isDelete: false },
  });
}

// Driver 생성
function createDriver(
  tx: Prisma.TransactionClient = prisma,
  data: Prisma.DriverUncheckedCreateInput
) {
  return tx.driver.create({ data });
}

// Driver 업데이트
function updateDriverByUserId(
  tx: Prisma.TransactionClient = prisma,
  where: Prisma.DriverWhereUniqueInput,
  data: Prisma.DriverUpdateInput
) {
  return tx.driver.update({ where, data });
}

// Service 일괄 업데이트 (user_id로)
function updateServicesByUserId(
  tx: Prisma.TransactionClient = prisma,
  userId: string,
  data: Prisma.ServiceUpdateInput
) {
  return tx.service.updateMany({
    where: { user_id: userId, isDelete: false },
    data,
  });
}

// Service 조회 (user_id로, 하나라도 있는지 확인)
function findServiceByUserId(
  tx: Prisma.TransactionClient = prisma,
  userId: string
) {
  return tx.service.findFirst({
    where: { user_id: userId, isDelete: false },
  });
}

// Service 일괄 생성
function createServices(
  tx: Prisma.TransactionClient = prisma,
  data: Prisma.ServiceCreateManyInput[]
) {
  if (data.length === 0) return;
  return tx.service.createMany({ data });
}

// Region 일괄 업데이트 (user_id로)
function updateRegionsByUserId(
  tx: Prisma.TransactionClient = prisma,
  userId: string,
  data: Prisma.RegionUpdateInput
) {
  return tx.region.updateMany({
    where: { user_id: userId, isDelete: false },
    data,
  });
}

// Region 조회 (user_id로, 하나라도 있는지 확인)
function findRegionByUserId(
  tx: Prisma.TransactionClient = prisma,
  userId: string
) {
  return tx.region.findFirst({
    where: { user_id: userId, isDelete: false },
  });
}

// Region 일괄 생성
function createRegions(
  tx: Prisma.TransactionClient = prisma,
  data: Prisma.RegionCreateManyInput[]
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

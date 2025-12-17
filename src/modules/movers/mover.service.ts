import moverRepository from "./mover.repository";

import type { MoverListQueryDTO } from "./mover.dto";
import { Prisma } from "../../generated/prisma";

async function getMovers(query: MoverListQueryDTO) {
  // 조회 조건 정리는 service에서 진행
  const where: Prisma.DriverWhereInput = {
    isDelete: false,
  };

  if (query.keyword) {
    where.OR = [{ nickname: { contains: query.keyword } }];
  }

  // Driver → User → Region/Service 관계를 통해 필터링
  if (query.region || query.service) {
    where.user = {};

    if (query.region) {
      where.user.region = {
        some: { region: query.region },
      };
    }

    if (query.service) {
      where.user.service = {
        some: { category: query.service },
      };
    }
  }

  const orderBy = getOrderBy(query.sort);

  return moverRepository.getMovers({
    where,
    orderBy,
    take: query.limit ?? 20,
    cursor: query.cursor ?? undefined,
    skip: query.cursor ? 1 : 0,
  });
}

function getOrderBy(sort?: MoverListSortType): Prisma.DriverOrderByWithRelationInput {
  switch (sort) {
    case 'RATING':
      return { rating: 'desc' };
    case 'REVIEW':
      return { reviewCount: 'desc' };
    case 'CAREER':
      return { careerYear: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
}

async function searchMoversByKeyword(keyword: string) {
  return moverRepository.searchMoversByNickname(keyword);
}

async function getMoverById(id: string) {
  return moverRepository.getMoverById(id);
}

export default {
  getMovers,
  searchMoversByKeyword,
  getMoverById,
};

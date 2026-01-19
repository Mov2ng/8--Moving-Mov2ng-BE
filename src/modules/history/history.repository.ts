import { Prisma } from "@prisma/client";
import prisma from "../../config/db";
import { SORT_ORDER } from "../../constants/pagenation";

export type HistoryRecord = Prisma.HistoryGetPayload<{}>;

async function findHistoryList(params: {
  page: number;
  pageSize: number;
}): Promise<{ totalItems: number; items: HistoryRecord[] }> {
  const [totalItems, items] = await prisma.$transaction([
    prisma.history.count(),
    prisma.history.findMany({
      orderBy: { createdAt: SORT_ORDER.DESC },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
  ]);

  return { totalItems, items };
}

async function findHistoryById(id: number): Promise<HistoryRecord | null> {
  return prisma.history.findUnique({ where: { id } });
}

const historyRepository = {
  findHistoryList,
  findHistoryById,
};

export default historyRepository;

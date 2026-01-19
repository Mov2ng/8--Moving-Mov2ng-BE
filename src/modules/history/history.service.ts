import ApiError from "../../core/http/ApiError";
import { HTTP_CODE, HTTP_MESSAGE, HTTP_STATUS } from "../../constants/http";
import { PAGINATION } from "../../constants/pagenation";
import historyRepository from "./history.repository";
import { HistoryItem, HistoryListResult } from "./history.dto";
import {
  HistoryDetailDto,
  HistoryListDto,
} from "../../validators/history.validation";

function normalizePagination(filters: HistoryListDto) {
  const page =
    filters.page === undefined || filters.page < PAGINATION.DEFAULT_PAGE
      ? PAGINATION.DEFAULT_PAGE
      : filters.page;
  const pageSize =
    filters.pageSize === undefined || filters.pageSize < PAGINATION.MIN_PAGE_SIZE
      ? PAGINATION.DEFAULT_PAGE_SIZE
      : Math.min(filters.pageSize, PAGINATION.MAX_PAGE_SIZE);
  return { page, pageSize };
}

function mapItem(record: Awaited<ReturnType<typeof historyRepository.findHistoryById>>): HistoryItem {
  if (!record) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.NOT_FOUND,
      HTTP_CODE.NOT_FOUND
    );
  }

  return {
    id: record.id,
    tableName: record.table_name,
    taskType: record.task_type,
    data: record.data,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function getHistoryList(
  filters: HistoryListDto
): Promise<HistoryListResult> {
  const { page, pageSize } = normalizePagination(filters);
  const { totalItems, items } = await historyRepository.findHistoryList({
    page,
    pageSize,
  });

  const totalPages = pageSize === 0 ? 0 : Math.ceil(totalItems / pageSize);
  return {
    items: items.map((record) => ({
      id: record.id,
      tableName: record.table_name,
      taskType: record.task_type,
      data: record.data,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })),
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}

async function getHistoryDetail(
  params: HistoryDetailDto
): Promise<HistoryItem> {
  const record = await historyRepository.findHistoryById(params.id);
  return mapItem(record);
}

const historyService = {
  getHistoryList,
  getHistoryDetail,
};

export default historyService;

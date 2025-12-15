import { Role } from "@prisma/client";
import ApiError from "../../../core/http/ApiError";
import {
  HTTP_CODE,
  HTTP_MESSAGE,
  HTTP_STATUS,
} from "../../../constants/http";
import { PAGINATION } from "../../../constants/pagenation";
import driverRequestRepository from "./request.driver.repository";
import {
  DriverDesignatedListQuery,
  DriverRequestListQuery,
} from "./request.driver.validation";
import { DriverRequestListResult } from "./request.driver.dto";

function normalizePagination(
  filters: DriverRequestListQuery | DriverDesignatedListQuery
) {
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

async function ensureDriver(userId: string) {
  const user = await driverRequestRepository.findDriverProfile(userId);

  if (!user || user.role !== Role.DRIVER) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      HTTP_MESSAGE.FORBIDDEN,
      HTTP_CODE.FORBIDDEN
    );
  }

  const driver = user.driver?.[0];
  if (!driver) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      HTTP_MESSAGE.FORBIDDEN,
      HTTP_CODE.FORBIDDEN
    );
  }

  const serviceCategories = user.service.map((service) => service.category);
  const regions = user.region.map((region) => region.region);

  if (serviceCategories.length === 0 || regions.length === 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      HTTP_MESSAGE.BAD_REQUEST,
      HTTP_CODE.BAD_REQUEST
    );
  }

  return { driverId: driver.id, serviceCategories, regions };
}

function validateFilters(
  filters: DriverRequestListQuery | DriverDesignatedListQuery,
  serviceCategories: string[],
  regions: string[]
) {
  if (
    filters.movingType !== undefined &&
    !serviceCategories.includes(filters.movingType)
  ) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      HTTP_MESSAGE.FORBIDDEN,
      HTTP_CODE.FORBIDDEN
    );
  }

  if (filters.region !== undefined && !regions.includes(filters.region)) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      HTTP_MESSAGE.FORBIDDEN,
      HTTP_CODE.FORBIDDEN
    );
  }
}

function toResult(
  page: number,
  pageSize: number,
  totalItems: number,
  requests: ReturnType<
    typeof driverRequestRepository.findDriverRequests
  > extends Promise<infer R>
    ? R extends { requests: infer U }
      ? U
      : never
    : never
): DriverRequestListResult {
  const totalPages = pageSize === 0 ? 0 : Math.ceil(totalItems / pageSize);

  const items = requests.map((request) => {
    const designatedEstimate = request.estimates?.[0];
    return {
      requestId: request.id,
      movingType: request.moving_type,
      movingDate: request.moving_data,
      origin: request.origin,
      destination: request.destination,
      isDesignated: request.estimates.length > 0,
      estimateId: designatedEstimate?.id,
      estimateStatus: designatedEstimate?.status,
      estimatePrice: designatedEstimate?.price,
      requestCreatedAt: request.createdAt,
      requestUpdatedAt: request.updatedAt,
    };
  });

  const designatedCount = items.filter((item) => item.isDesignated).length;

  return {
    items,
    designatedCount,
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}

async function getDriverRequestList(
  userId: string,
  filters: DriverRequestListQuery
): Promise<DriverRequestListResult> {
  const { page, pageSize } = normalizePagination(filters);
  const { driverId, serviceCategories, regions } = await ensureDriver(userId);
  validateFilters(filters, serviceCategories, regions);

  const { totalItems, requests } = await driverRequestRepository.findDriverRequests({
    driverId,
    filters: { ...filters, page, pageSize },
    serviceCategories,
    regions,
  });

  return toResult(page, pageSize, totalItems, requests);
}

async function getDriverDesignatedRequestList(
  userId: string,
  filters: DriverDesignatedListQuery
): Promise<DriverRequestListResult> {
  const designatedFilters: DriverDesignatedListQuery = {
    ...filters,
    isDesignated: true,
  };
  return getDriverRequestList(userId, designatedFilters);
}

const driverRequestService = {
  getDriverRequestList,
  getDriverDesignatedRequestList,
};

export default driverRequestService;

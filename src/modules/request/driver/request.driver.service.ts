import { Category, EstimateStatus, RegionType, Role } from "@prisma/client";
import ApiError from "../../../core/http/ApiError";
import {
  HTTP_CODE,
  HTTP_MESSAGE,
  HTTP_STATUS,
} from "../../../constants/http";
import { PAGINATION } from "../../../constants/pagenation";
import driverRequestRepository from "./request.driver.repository";
import {
  DriverEstimateAcceptDto,
  DriverEstimateRejectDto,
  DriverEstimateUpdateDto,
  DriverDesignatedListDto,
  DriverRequestDeleteDto,
  DriverRequestListDto,
  DriverRejectedEstimateListDto,
} from "../../../validators/request.driver.validation";
import {
  DriverRejectedEstimateListResult,
  DriverRequestListResult,
} from "./request.driver.dto";
import { ESTIMATE, ESTIMATE_MESSAGE } from "../../../constants/estimate";

function normalizePagination(
  filters: DriverRequestListDto | DriverDesignatedListDto | DriverRejectedEstimateListDto
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

async function ensureDriver(userId: string): Promise<{
  driverId: number;
  serviceCategories: Category[];
  regions: RegionType[];
}> {
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

  const serviceCategories = user.service.map((service) => service.category as Category);
  const regions = user.region.map((region) => region.region as RegionType);

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
  filters: DriverRequestListDto | DriverDesignatedListDto,
  serviceCategories: Category[],
  regions: RegionType[]
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
      userId: request.user_id,
      userName: request.user?.name,
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
  filters: DriverRequestListDto
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
  filters: DriverDesignatedListDto
): Promise<DriverRequestListResult> {
  const designatedFilters: DriverDesignatedListDto = {
    ...filters,
    isDesignated: true,
  };
  return getDriverRequestList(userId, designatedFilters);
}

async function ensureRequestAccessible(
  driverId: number,
  requestId: number,
  serviceCategories: Category[],
  regions: RegionType[]
) {
  const { requests } = await driverRequestRepository.findDriverRequests({
    driverId,
    filters: {
      requestId,
      page: PAGINATION.DEFAULT_PAGE,
      pageSize: PAGINATION.MIN_PAGE_SIZE,
      sort: "soonest",
    },
    serviceCategories,
    regions,
  });

  const request = requests[0];
  if (!request) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.NOT_FOUND,
      HTTP_CODE.NOT_FOUND
    );
  }

  return request.id;
}

async function createEstimateAndApprove(
  userId: string,
  body: DriverEstimateAcceptDto
) {
  const { driverId, serviceCategories, regions } = await ensureDriver(userId);
  await ensureRequestAccessible(driverId, body.requestId, serviceCategories, regions);

  const existing = await driverRequestRepository.findLatestEstimate(
    driverId,
    body.requestId
  );

  if (existing) {
    if (existing.status === EstimateStatus.ACCEPTED || existing.status === EstimateStatus.REJECTED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ESTIMATE_MESSAGE.ALREADY_DECIDED,
        HTTP_CODE.BAD_REQUEST
      );
    }


    // PENDING 
    return driverRequestRepository.updateEstimate({
      estimateId: existing.id,
      status: EstimateStatus.ACCEPTED,
      requestReason: body.requestReason,
      price: body.price ?? 0,
      isRequest: true,
    });
  }

  return driverRequestRepository.createEstimate({
    driverId,
    requestId: body.requestId,
    status: EstimateStatus.ACCEPTED,
    requestReason: body.requestReason,
    price: body.price ?? 0,
    isRequest: true,
  });
}

async function updateEstimateDecision(
  userId: string,
  body: DriverEstimateUpdateDto
) {
  const { driverId, serviceCategories, regions } = await ensureDriver(userId);
  await ensureRequestAccessible(driverId, body.requestId, serviceCategories, regions);

  const existing = await driverRequestRepository.findLatestEstimate(
    driverId,
    body.requestId
  );

  if (!existing) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      HTTP_MESSAGE.NOT_FOUND,
      HTTP_CODE.NOT_FOUND
    );
  }

  let status: EstimateStatus;
  let price: number;
  if (body.status === "ACCEPTED") {
    status = EstimateStatus.ACCEPTED;
    price = body.price;
  } else {
    status = EstimateStatus.REJECTED;
    price = ESTIMATE.REJECT_PRICE;
  }

  return driverRequestRepository.updateEstimate({
    estimateId: existing.id,
    status,
    requestReason: body.requestReason,
    price,
    isRequest: true,
  });
}

async function createEstimateAndReject(
  userId: string,
  body: DriverEstimateRejectDto
) {
  const { driverId, serviceCategories, regions } = await ensureDriver(userId);
  await ensureRequestAccessible(driverId, body.requestId, serviceCategories, regions);

  const existing = await driverRequestRepository.findLatestEstimate(
    driverId,
    body.requestId
  );

  if (existing) {
    if (existing.status === EstimateStatus.ACCEPTED || existing.status === EstimateStatus.REJECTED) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        ESTIMATE_MESSAGE.ALREADY_DECIDED,
        HTTP_CODE.BAD_REQUEST
      );
    }

    // PENDING ?��? 반려�??�데?�트
    return driverRequestRepository.updateEstimate({
      estimateId: existing.id,
      status: EstimateStatus.REJECTED,
      requestReason: body.requestReason,
      price: ESTIMATE.REJECT_PRICE,
      isRequest: true,
    });
  }

  return driverRequestRepository.createEstimate({
    driverId,
    requestId: body.requestId,
    status: EstimateStatus.REJECTED,
    requestReason: body.requestReason,
    price: ESTIMATE.REJECT_PRICE,
    isRequest: true,
  });
}

async function getDriverRejectedEstimates(
  userId: string,
  filters: DriverRejectedEstimateListDto
): Promise<DriverRejectedEstimateListResult> {
  const { page, pageSize } = normalizePagination(filters);
  const { driverId } = await ensureDriver(userId);

  const { totalItems, estimates } = await driverRequestRepository.findRejectedEstimates({
    driverId,
    page,
    pageSize,
  });

  const items = estimates.map((estimate) => ({
    estimateId: estimate.id,
    requestId: estimate.request_id,
    driverId: estimate.driver_id,
    status: estimate.status,
    requestReason: estimate.request_reson ?? undefined,
    isRequest: estimate.isRequest,
    price: estimate.price,
    createdAt: estimate.createdAt,
    updatedAt: estimate.updatedAt,
    request: estimate.request
      ? {
          movingType: estimate.request.moving_type,
          movingDate: estimate.request.moving_data,
          origin: estimate.request.origin,
          destination: estimate.request.destination,
        }
      : undefined,
  }));

  const totalPages = pageSize === 0 ? 0 : Math.ceil(totalItems / pageSize);
  return { items, page, pageSize, totalItems, totalPages };
}

async function deleteDriverRequest(
  userId: string,
  body: DriverRequestDeleteDto
) {
  const { driverId, serviceCategories, regions } = await ensureDriver(userId);
  const requestId = await ensureRequestAccessible(
    driverId,
    body.requestId,
    serviceCategories,
    regions
  );

  return driverRequestRepository.deleteRequestWithEstimates(requestId);
}

const driverRequestService = {
  getDriverRequestList,
  getDriverDesignatedRequestList,
  createEstimateAndApprove,
  createEstimateAndReject,
  updateEstimateDecision,
  getDriverRejectedEstimates,
  deleteDriverRequest,
};

export default driverRequestService;

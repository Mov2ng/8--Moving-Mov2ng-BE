"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../../../core/http/ApiError"));
const http_1 = require("../../../constants/http");
const pagenation_1 = require("../../../constants/pagenation");
const request_driver_repository_1 = __importDefault(require("./request.driver.repository"));
const estimate_1 = require("../../../constants/estimate");
function normalizePagination(filters) {
    const page = filters.page === undefined || filters.page < pagenation_1.PAGINATION.DEFAULT_PAGE
        ? pagenation_1.PAGINATION.DEFAULT_PAGE
        : filters.page;
    const pageSize = filters.pageSize === undefined || filters.pageSize < pagenation_1.PAGINATION.MIN_PAGE_SIZE
        ? pagenation_1.PAGINATION.DEFAULT_PAGE_SIZE
        : Math.min(filters.pageSize, pagenation_1.PAGINATION.MAX_PAGE_SIZE);
    return { page, pageSize };
}
async function ensureDriver(userId) {
    const user = await request_driver_repository_1.default.findDriverProfile(userId);
    if (!user || user.role !== client_1.Role.DRIVER) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.FORBIDDEN, http_1.HTTP_MESSAGE.FORBIDDEN, http_1.HTTP_CODE.FORBIDDEN);
    }
    const driver = user.driver?.[0];
    if (!driver) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.FORBIDDEN, http_1.HTTP_MESSAGE.FORBIDDEN, http_1.HTTP_CODE.FORBIDDEN);
    }
    const serviceCategories = user.service.map((service) => service.category);
    const regions = user.region.map((region) => region.region);
    if (serviceCategories.length === 0 || regions.length === 0) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.BAD_REQUEST, http_1.HTTP_MESSAGE.BAD_REQUEST, http_1.HTTP_CODE.BAD_REQUEST);
    }
    return { driverId: driver.id, serviceCategories, regions };
}
function validateFilters(filters, serviceCategories, regions) {
    if (filters.movingType !== undefined &&
        !serviceCategories.includes(filters.movingType)) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.FORBIDDEN, http_1.HTTP_MESSAGE.FORBIDDEN, http_1.HTTP_CODE.FORBIDDEN);
    }
    if (filters.region !== undefined && !regions.includes(filters.region)) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.FORBIDDEN, http_1.HTTP_MESSAGE.FORBIDDEN, http_1.HTTP_CODE.FORBIDDEN);
    }
}
function toResult(page, pageSize, totalItems, requests) {
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
async function getDriverRequestList(userId, filters) {
    const { page, pageSize } = normalizePagination(filters);
    const { driverId, serviceCategories, regions } = await ensureDriver(userId);
    validateFilters(filters, serviceCategories, regions);
    const { totalItems, requests } = await request_driver_repository_1.default.findDriverRequests({
        driverId,
        filters: { ...filters, page, pageSize },
        serviceCategories,
        regions,
    });
    return toResult(page, pageSize, totalItems, requests);
}
async function getDriverDesignatedRequestList(userId, filters) {
    const designatedFilters = {
        ...filters,
        isDesignated: true,
    };
    return getDriverRequestList(userId, designatedFilters);
}
async function ensureRequestAccessible(driverId, requestId, serviceCategories, regions) {
    const { requests } = await request_driver_repository_1.default.findDriverRequests({
        driverId,
        filters: {
            requestId,
            page: pagenation_1.PAGINATION.DEFAULT_PAGE,
            pageSize: pagenation_1.PAGINATION.MIN_PAGE_SIZE,
            sort: "soonest",
        },
        serviceCategories,
        regions,
    });
    const request = requests[0];
    if (!request) {
        throw new ApiError_1.default(http_1.HTTP_STATUS.NOT_FOUND, http_1.HTTP_MESSAGE.NOT_FOUND, http_1.HTTP_CODE.NOT_FOUND);
    }
    return request.id;
}
async function createEstimateAndApprove(userId, body) {
    const { driverId, serviceCategories, regions } = await ensureDriver(userId);
    await ensureRequestAccessible(driverId, body.requestId, serviceCategories, regions);
    const existing = await request_driver_repository_1.default.findLatestEstimate(driverId, body.requestId);
    if (existing) {
        if (existing.status === client_1.EstimateStatus.ACCEPTED) {
            throw new ApiError_1.default(http_1.HTTP_STATUS.BAD_REQUEST, estimate_1.ESTIMATE_MESSAGE.ALREADY_DECIDED, http_1.HTTP_CODE.BAD_REQUEST);
        }
        if (existing.status === client_1.EstimateStatus.REJECTED) {
            // 반려 → 승인으로 수정 허용
            return request_driver_repository_1.default.updateEstimate({
                estimateId: existing.id,
                status: client_1.EstimateStatus.ACCEPTED,
                requestReason: body.requestReason,
                price: body.price ?? 0,
                isRequest: true,
            });
        }
        // PENDING 등은 승인으로 업데이트
        return request_driver_repository_1.default.updateEstimate({
            estimateId: existing.id,
            status: client_1.EstimateStatus.ACCEPTED,
            requestReason: body.requestReason,
            price: body.price ?? 0,
            isRequest: true,
        });
    }
    return request_driver_repository_1.default.createEstimate({
        driverId,
        requestId: body.requestId,
        status: client_1.EstimateStatus.ACCEPTED,
        requestReason: body.requestReason,
        price: body.price ?? 0,
        isRequest: true,
    });
}
async function createEstimateAndReject(userId, body) {
    const { driverId, serviceCategories, regions } = await ensureDriver(userId);
    await ensureRequestAccessible(driverId, body.requestId, serviceCategories, regions);
    const existing = await request_driver_repository_1.default.findLatestEstimate(driverId, body.requestId);
    if (existing) {
        if (existing.status === client_1.EstimateStatus.ACCEPTED || existing.status === client_1.EstimateStatus.REJECTED) {
            throw new ApiError_1.default(http_1.HTTP_STATUS.BAD_REQUEST, estimate_1.ESTIMATE_MESSAGE.ALREADY_DECIDED, http_1.HTTP_CODE.BAD_REQUEST);
        }
        // PENDING 등은 반려로 업데이트
        return request_driver_repository_1.default.updateEstimate({
            estimateId: existing.id,
            status: client_1.EstimateStatus.REJECTED,
            requestReason: body.requestReason,
            price: estimate_1.ESTIMATE.REJECT_PRICE,
            isRequest: true,
        });
    }
    return request_driver_repository_1.default.createEstimate({
        driverId,
        requestId: body.requestId,
        status: client_1.EstimateStatus.REJECTED,
        requestReason: body.requestReason,
        price: estimate_1.ESTIMATE.REJECT_PRICE,
        isRequest: true,
    });
}
async function getDriverRejectedEstimates(userId, filters) {
    const { page, pageSize } = normalizePagination(filters);
    const { driverId } = await ensureDriver(userId);
    const { totalItems, estimates } = await request_driver_repository_1.default.findRejectedEstimates({
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
const driverRequestService = {
    getDriverRequestList,
    getDriverDesignatedRequestList,
    createEstimateAndApprove,
    createEstimateAndReject,
    getDriverRejectedEstimates,
};
exports.default = driverRequestService;
//# sourceMappingURL=request.driver.service.js.map
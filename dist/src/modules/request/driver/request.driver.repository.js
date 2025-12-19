"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const db_1 = __importDefault(require("../../../config/db"));
const pagenation_1 = require("../../../constants/pagenation");
const region_utils_1 = require("../../../utils/region.utils");
async function findDriverProfile(userId) {
    return db_1.default.user.findFirst({
        where: { id: userId, isDelete: false, role: client_1.Role.DRIVER },
        include: {
            driver: { where: { isDelete: false } },
            service: { where: { isDelete: false } },
            region: { where: { isDelete: false } },
        },
    });
}
async function findDriverRequests({ driverId, filters, serviceCategories, regions, }) {
    const { movingType, isDesignated, sort, region, requestId } = filters;
    const where = {
        ...(requestId !== undefined && { id: requestId }),
        moving_type: movingType ?? { in: serviceCategories },
        ...(isDesignated !== undefined && {
            estimates: isDesignated
                ? { some: { driver_id: driverId } }
                : { none: { driver_id: driverId } },
        }),
    };
    const orderBy = sort === "recent"
        ? { createdAt: pagenation_1.SORT_ORDER.DESC }
        : { moving_data: pagenation_1.SORT_ORDER.ASC };
    const allRequests = await db_1.default.request.findMany({
        where,
        orderBy,
        include: {
            estimates: {
                where: { driver_id: driverId },
                orderBy: [{ createdAt: pagenation_1.SORT_ORDER.DESC }],
            },
        },
    });
    const filteredRequests = allRequests.filter((request) => {
        const originInRegion = (0, region_utils_1.isAddressInServiceRegions)(request.origin, regions);
        if (!originInRegion)
            return false;
        if (region !== undefined) {
            return (0, region_utils_1.isAddressInServiceRegions)(request.origin, [region]);
        }
        return true;
    });
    if (sort === "recent") {
        filteredRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    else {
        filteredRequests.sort((a, b) => a.moving_data.getTime() - b.moving_data.getTime());
    }
    return { totalItems: filteredRequests.length, requests: filteredRequests };
}
const driverRequestRepository = {
    findDriverProfile,
    findDriverRequests,
    async createEstimate(params) {
        const estimate = await db_1.default.estimate.create({
            data: {
                driver_id: params.driverId,
                request_id: params.requestId,
                status: params.status,
                request_reson: params.requestReason,
                price: params.price,
                isRequest: params.isRequest,
            },
        });
        return {
            estimateId: estimate.id,
            requestId: estimate.request_id,
            driverId: estimate.driver_id,
            status: estimate.status,
            requestReason: estimate.request_reson ?? "",
            isRequest: estimate.isRequest,
            price: estimate.price,
            createdAt: estimate.createdAt,
            updatedAt: estimate.updatedAt,
        };
    },
    async findLatestEstimate(driverId, requestId) {
        return db_1.default.estimate.findFirst({
            where: { driver_id: driverId, request_id: requestId },
            orderBy: { createdAt: pagenation_1.SORT_ORDER.DESC },
        });
    },
    async updateEstimate(params) {
        const updated = await db_1.default.estimate.update({
            where: { id: params.estimateId },
            data: {
                status: params.status,
                request_reson: params.requestReason,
                price: params.price,
                isRequest: params.isRequest,
            },
        });
        return {
            estimateId: updated.id,
            requestId: updated.request_id,
            driverId: updated.driver_id,
            status: updated.status,
            requestReason: updated.request_reson ?? "",
            isRequest: updated.isRequest,
            price: updated.price,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
    },
    async findRejectedEstimates(params) {
        const where = {
            driver_id: params.driverId,
            status: "REJECTED",
            isRequest: true,
        };
        const [totalItems, estimates] = await db_1.default.$transaction([
            db_1.default.estimate.count({ where }),
            db_1.default.estimate.findMany({
                where,
                orderBy: { createdAt: pagenation_1.SORT_ORDER.DESC },
                skip: (params.page - 1) * params.pageSize,
                take: params.pageSize,
                include: { request: true },
            }),
        ]);
        return { totalItems, estimates };
    },
};
exports.default = driverRequestRepository;
//# sourceMappingURL=request.driver.repository.js.map
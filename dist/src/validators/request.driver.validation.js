"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverRejectedEstimateListDto = exports.driverEstimateRejectDto = exports.driverEstimateAcceptDto = exports.driverDesignatedRequestListDto = exports.driverRequestListDto = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const pagenation_1 = require("../constants/pagenation");
const sortEnum = zod_1.z.enum(["soonest", "recent"]);
exports.driverRequestListDto = zod_1.z.object({
    query: zod_1.z.object({
        userId: zod_1.z.string().min(1),
        page: zod_1.z.coerce.number().int().min(pagenation_1.PAGINATION.DEFAULT_PAGE).default(pagenation_1.PAGINATION.DEFAULT_PAGE),
        pageSize: zod_1.z.coerce.number().int().min(pagenation_1.PAGINATION.MIN_PAGE_SIZE).max(pagenation_1.PAGINATION.MAX_PAGE_SIZE).default(pagenation_1.PAGINATION.DEFAULT_PAGE_SIZE),
        requestId: zod_1.z.coerce.number().int().optional(),
        movingType: zod_1.z.nativeEnum(client_1.Category).optional(),
        region: zod_1.z.nativeEnum(client_1.RegionType).optional(),
        isDesignated: zod_1.z.union([zod_1.z.literal("true"), zod_1.z.literal("false")]).optional()
            .transform((v) => (v === undefined ? undefined : v === "true")),
        sort: sortEnum.default("soonest"),
    }),
});
exports.driverDesignatedRequestListDto = zod_1.z.object({
    query: zod_1.z.object({
        userId: zod_1.z.string().min(1),
        page: zod_1.z.coerce.number().int().min(pagenation_1.PAGINATION.DEFAULT_PAGE).default(pagenation_1.PAGINATION.DEFAULT_PAGE),
        pageSize: zod_1.z.coerce.number().int().min(pagenation_1.PAGINATION.MIN_PAGE_SIZE).max(pagenation_1.PAGINATION.MAX_PAGE_SIZE).default(pagenation_1.PAGINATION.DEFAULT_PAGE_SIZE),
        movingType: zod_1.z.nativeEnum(client_1.Category).optional(),
        region: zod_1.z.nativeEnum(client_1.RegionType).optional(),
        requestId: zod_1.z.coerce.number().int().optional(),
        sort: sortEnum.default("soonest"),
    }),
});
exports.driverEstimateAcceptDto = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().min(1),
        requestId: zod_1.z.coerce.number().int(),
        requestReason: zod_1.z.string().min(1),
        price: zod_1.z.coerce.number().int().positive(),
    }),
});
exports.driverEstimateRejectDto = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string().min(1),
        requestId: zod_1.z.coerce.number().int(),
        requestReason: zod_1.z.string().min(1),
    }),
});
exports.driverRejectedEstimateListDto = zod_1.z.object({
    query: zod_1.z.object({
        userId: zod_1.z.string().min(1),
        page: zod_1.z.coerce.number().int().min(pagenation_1.PAGINATION.DEFAULT_PAGE).default(pagenation_1.PAGINATION.DEFAULT_PAGE),
        pageSize: zod_1.z
            .coerce.number()
            .int()
            .min(pagenation_1.PAGINATION.MIN_PAGE_SIZE)
            .max(pagenation_1.PAGINATION.MAX_PAGE_SIZE)
            .default(pagenation_1.PAGINATION.DEFAULT_PAGE_SIZE),
    }),
});
//# sourceMappingURL=request.driver.validation.js.map
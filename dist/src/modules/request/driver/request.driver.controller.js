"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiResponse_1 = __importDefault(require("../../../core/http/ApiResponse"));
const asyncWrapper_1 = require("../../../utils/asyncWrapper");
const request_driver_service_1 = __importDefault(require("./request.driver.service"));
const request_driver_dto_1 = require("./request.driver.dto");
const getDriverRequests = (0, asyncWrapper_1.asyncWrapper)(async (req, res) => {
    const validated = res.locals.validated;
    const { userId, ...filters } = validated.query;
    const data = await request_driver_service_1.default.getDriverRequestList(userId, filters);
    const response = (0, request_driver_dto_1.toDriverRequestListResponseDto)(data);
    return ApiResponse_1.default.success(res, response);
});
const getDriverDesignatedRequests = (0, asyncWrapper_1.asyncWrapper)(async (req, res) => {
    const validated = res.locals.validated;
    const { userId, ...filters } = validated.query;
    const data = await request_driver_service_1.default.getDriverDesignatedRequestList(userId, filters);
    const response = (0, request_driver_dto_1.toDriverRequestListResponseDto)(data);
    return ApiResponse_1.default.success(res, response);
});
const acceptEstimate = (0, asyncWrapper_1.asyncWrapper)(async (req, res) => {
    const validated = res.locals.validated;
    const { userId, ...body } = validated.body;
    const data = await request_driver_service_1.default.createEstimateAndApprove(userId, body);
    return ApiResponse_1.default.success(res, data);
});
const rejectEstimate = (0, asyncWrapper_1.asyncWrapper)(async (req, res) => {
    const validated = res.locals.validated;
    const { userId, ...body } = validated.body;
    const data = await request_driver_service_1.default.createEstimateAndReject(userId, body);
    return ApiResponse_1.default.success(res, data);
});
const getRejectedEstimates = (0, asyncWrapper_1.asyncWrapper)(async (req, res) => {
    const validated = res.locals.validated;
    const { userId, ...filters } = validated.query;
    const data = await request_driver_service_1.default.getDriverRejectedEstimates(userId, filters);
    return ApiResponse_1.default.success(res, data);
});
const driverRequestController = {
    getDriverRequests,
    getDriverDesignatedRequests,
    acceptEstimate,
    rejectEstimate,
    getRejectedEstimates,
};
exports.default = driverRequestController;
//# sourceMappingURL=request.driver.controller.js.map
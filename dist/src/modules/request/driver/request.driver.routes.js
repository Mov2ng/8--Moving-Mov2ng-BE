"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_middleware_1 = __importDefault(require("../../../middlewares/validate.middleware"));
const request_driver_controller_1 = __importDefault(require("./request.driver.controller"));
const request_driver_validation_1 = require("../../../validators/request.driver.validation");
const router = (0, express_1.Router)();
router.get("/requests/driver/list", (0, validate_middleware_1.default)(request_driver_validation_1.driverRequestListDto), request_driver_controller_1.default.getDriverRequests);
router.get("/requests/driver/estimate/list", (0, validate_middleware_1.default)(request_driver_validation_1.driverDesignatedRequestListDto), request_driver_controller_1.default.getDriverDesignatedRequests);
router.post("/requests/driver/estimate/accept", (0, validate_middleware_1.default)(request_driver_validation_1.driverEstimateAcceptDto), request_driver_controller_1.default.acceptEstimate);
router.post("/requests/driver/estimate/reject", (0, validate_middleware_1.default)(request_driver_validation_1.driverEstimateRejectDto), request_driver_controller_1.default.rejectEstimate);
router.get("/requests/driver/estimate/rejected", (0, validate_middleware_1.default)(request_driver_validation_1.driverRejectedEstimateListDto), request_driver_controller_1.default.getRejectedEstimates);
exports.default = router;
//# sourceMappingURL=request.driver.routes.js.map
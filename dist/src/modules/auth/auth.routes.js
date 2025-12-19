"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("./auth.controller"));
const validate_middleware_1 = __importDefault(require("../../middlewares/validate.middleware"));
const auth_validator_1 = require("../../validators/auth.validator");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const authRouter = express_1.default.Router();
authRouter.post("/signup", (0, validate_middleware_1.default)(auth_validator_1.signupSchema), auth_controller_1.default.signup);
authRouter.post("/login", (0, validate_middleware_1.default)(auth_validator_1.loginSchema), auth_controller_1.default.login);
authRouter.post("/logout", auth_middleware_1.authMiddleware, auth_controller_1.default.logout);
exports.default = authRouter;
//# sourceMappingURL=auth.routes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_1 = require("./docs/swagger");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("./services/discordBot");
const request_driver_routes_1 = __importDefault(require("./modules/request/driver/request.driver.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const env_1 = __importDefault(require("./config/env"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); // 쿠키 읽기 위한 쿠키 파싱 활성화
// CORS 설정 (개발용 전체 오리진 허용 + 쿠키 전달)
app.use((0, cors_1.default)({ origin: true, credentials: true }));
// 라우트
app.use("/auth", auth_routes_1.default);
app.use("/api", request_driver_routes_1.default);
app.use(error_middleware_1.default);
(0, swagger_1.setupSwagger)(app);
// 공통 에러 핸들러 등록
app.use(error_middleware_1.default);
const port = env_1.default.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
//# sourceMappingURL=app.js.map
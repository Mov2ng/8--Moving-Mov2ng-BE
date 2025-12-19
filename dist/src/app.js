"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_1 = require("./docs/swagger");
require("./services/discordBot");
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const request_driver_routes_1 = __importDefault(require("./modules/request/driver/request.driver.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const env_1 = __importDefault(require("./config/env"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// app.use(cookieParser()); // 왜 기본 세팅할 때 이거 세팅 안한거지..??
// 모든 도메인 허용
// app.use(cors()); // 엥 이것두..?
// 라우트
app.use("/auth", auth_routes_1.default);
app.use("/api", request_driver_routes_1.default);
app.use(error_middleware_1.default);
(0, swagger_1.setupSwagger)(app);
const port = env_1.default.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
//# sourceMappingURL=app.js.map
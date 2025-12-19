"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const env_1 = __importDefault(require("./env"));
/**
 * DB 연결 설정
 * - $connect() 첫 호출에 DB 연결 지연 생성
 */
const databaseUrl = env_1.default.DATABASE_URL;
// PrismaPg 어댑터 생성
const adapter = new adapter_pg_1.PrismaPg({
    // 데이터베이스 URL
    connectionString: databaseUrl,
});
// PrismaClient 인스턴스 생성
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
//# sourceMappingURL=db.js.map
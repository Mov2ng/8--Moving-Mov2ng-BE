"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDriverRequestListResponseDto = toDriverRequestListResponseDto;
function mapItem(item) {
    return { ...item };
}
function toDriverRequestListResponseDto(result) {
    return {
        items: result.items.map(mapItem),
        designatedCount: result.designatedCount,
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
    };
}
//# sourceMappingURL=request.driver.dto.js.map
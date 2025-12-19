"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRegionFromAddress = extractRegionFromAddress;
exports.isAddressInServiceRegions = isAddressInServiceRegions;
const client_1 = require("@prisma/client");
/**
 * 주소 문자열에서 지역(RegionType)을 추출합니다.
 * @param address 주소 문자열 (예: "서울시 강남구...", "경기도 성남시...")
 * @returns 추출된 RegionType 또는 null
 */
function extractRegionFromAddress(address) {
    const normalizedAddress = address.trim();
    // 지역명 매핑 (한글명 -> RegionType)
    // 더 긴 문자열을 먼저 확인하여 "경기"가 "경기도"보다 먼저 매칭되는 것을 방지
    const regionMap = [
        { key: "서울시", regionType: client_1.RegionType.SEOUL },
        { key: "서울", regionType: client_1.RegionType.SEOUL },
        { key: "경기도", regionType: client_1.RegionType.GYEONGGI },
        { key: "경기", regionType: client_1.RegionType.GYEONGGI },
        { key: "인천시", regionType: client_1.RegionType.INCHEON },
        { key: "인천", regionType: client_1.RegionType.INCHEON },
        { key: "강원도", regionType: client_1.RegionType.GANGWON },
        { key: "강원", regionType: client_1.RegionType.GANGWON },
        { key: "충청북도", regionType: client_1.RegionType.CHUNGBUK },
        { key: "충북", regionType: client_1.RegionType.CHUNGBUK },
        { key: "충청남도", regionType: client_1.RegionType.CHUNGNAM },
        { key: "충남", regionType: client_1.RegionType.CHUNGNAM },
        { key: "세종시", regionType: client_1.RegionType.SEJONG },
        { key: "세종", regionType: client_1.RegionType.SEJONG },
        { key: "대전시", regionType: client_1.RegionType.DAEJEON },
        { key: "대전", regionType: client_1.RegionType.DAEJEON },
        { key: "전라북도", regionType: client_1.RegionType.JEONBUK },
        { key: "전북", regionType: client_1.RegionType.JEONBUK },
        { key: "전라남도", regionType: client_1.RegionType.JEONNAM },
        { key: "전남", regionType: client_1.RegionType.JEONNAM },
        { key: "광주시", regionType: client_1.RegionType.GWANGJU },
        { key: "광주", regionType: client_1.RegionType.GWANGJU },
        { key: "경상북도", regionType: client_1.RegionType.GYEONGBUK },
        { key: "경북", regionType: client_1.RegionType.GYEONGBUK },
        { key: "경상남도", regionType: client_1.RegionType.GYEONGNAM },
        { key: "경남", regionType: client_1.RegionType.GYEONGNAM },
        { key: "대구시", regionType: client_1.RegionType.DAEGU },
        { key: "대구", regionType: client_1.RegionType.DAEGU },
        { key: "울산시", regionType: client_1.RegionType.ULSAN },
        { key: "울산", regionType: client_1.RegionType.ULSAN },
        { key: "부산시", regionType: client_1.RegionType.BUSAN },
        { key: "부산", regionType: client_1.RegionType.BUSAN },
        { key: "제주도", regionType: client_1.RegionType.JEJU },
        { key: "제주", regionType: client_1.RegionType.JEJU },
    ];
    // 주소 문자열에서 지역명 찾기 (더 긴 문자열을 먼저 확인)
    for (const { key, regionType } of regionMap) {
        if (normalizedAddress.includes(key)) {
            return regionType;
        }
    }
    return null;
}
/**
 * 주소(origin 또는 destination)가 기사의 서비스 가능 지역에 포함되는지 확인합니다.
 * @param address 주소 문자열
 * @param serviceRegions 기사의 서비스 가능 지역 목록
 * @returns 서비스 가능 지역에 포함되면 true
 */
function isAddressInServiceRegions(address, serviceRegions) {
    const extractedRegion = extractRegionFromAddress(address);
    if (!extractedRegion) {
        return false;
    }
    return serviceRegions.includes(extractedRegion);
}
//# sourceMappingURL=region.utils.js.map
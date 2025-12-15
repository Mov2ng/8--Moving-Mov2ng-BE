import { RegionType } from "@prisma/client";

/**
 * 주소 문자열에서 지역(RegionType)을 추출합니다.
 * @param address 주소 문자열 (예: "서울시 강남구...", "경기도 성남시...")
 * @returns 추출된 RegionType 또는 null
 */
export function extractRegionFromAddress(address: string): RegionType | null {
  const normalizedAddress = address.trim();

  // 지역명 매핑 (한글명 -> RegionType)
  // 더 긴 문자열을 먼저 확인하여 "경기"가 "경기도"보다 먼저 매칭되는 것을 방지
  const regionMap: Array<{ key: string; regionType: RegionType }> = [
    { key: "서울시", regionType: RegionType.SEOUL },
    { key: "서울", regionType: RegionType.SEOUL },
    { key: "경기도", regionType: RegionType.GYEONGGI },
    { key: "경기", regionType: RegionType.GYEONGGI },
    { key: "인천시", regionType: RegionType.INCHEON },
    { key: "인천", regionType: RegionType.INCHEON },
    { key: "강원도", regionType: RegionType.GANGWON },
    { key: "강원", regionType: RegionType.GANGWON },
    { key: "충청북도", regionType: RegionType.CHUNGBUK },
    { key: "충북", regionType: RegionType.CHUNGBUK },
    { key: "충청남도", regionType: RegionType.CHUNGNAM },
    { key: "충남", regionType: RegionType.CHUNGNAM },
    { key: "세종시", regionType: RegionType.SEJONG },
    { key: "세종", regionType: RegionType.SEJONG },
    { key: "대전시", regionType: RegionType.DAEJEON },
    { key: "대전", regionType: RegionType.DAEJEON },
    { key: "전라북도", regionType: RegionType.JEONBUK },
    { key: "전북", regionType: RegionType.JEONBUK },
    { key: "전라남도", regionType: RegionType.JEONNAM },
    { key: "전남", regionType: RegionType.JEONNAM },
    { key: "광주시", regionType: RegionType.GWANGJU },
    { key: "광주", regionType: RegionType.GWANGJU },
    { key: "경상북도", regionType: RegionType.GYEONGBUK },
    { key: "경북", regionType: RegionType.GYEONGBUK },
    { key: "경상남도", regionType: RegionType.GYEONGNAM },
    { key: "경남", regionType: RegionType.GYEONGNAM },
    { key: "대구시", regionType: RegionType.DAEGU },
    { key: "대구", regionType: RegionType.DAEGU },
    { key: "울산시", regionType: RegionType.ULSAN },
    { key: "울산", regionType: RegionType.ULSAN },
    { key: "부산시", regionType: RegionType.BUSAN },
    { key: "부산", regionType: RegionType.BUSAN },
    { key: "제주도", regionType: RegionType.JEJU },
    { key: "제주", regionType: RegionType.JEJU },
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
export function isAddressInServiceRegions(
  address: string,
  serviceRegions: RegionType[]
): boolean {
  const extractedRegion = extractRegionFromAddress(address);
  if (!extractedRegion) {
    return false;
  }
  return serviceRegions.includes(extractedRegion);
}


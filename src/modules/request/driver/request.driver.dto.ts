import { Category, EstimateStatus } from "@prisma/client";

export type DriverRequestListItem = {
  requestId: number;
  movingType: Category;
  movingDate: Date;
  origin: string;
  destination: string;
  isDesignated: boolean;
  estimateId?: number;
  estimateStatus?: EstimateStatus;
  estimatePrice?: number;
  userId?: string;
  userName?: string;
  requestCreatedAt: Date;
  requestUpdatedAt: Date;
};

export type DriverEstimateActionResponse = {
  estimateId: number;
  requestId: number;
  driverId: number;
  status: EstimateStatus;
  requestReason: string;
  isRequest: boolean;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};

export type DriverRejectedEstimateItem = {
  estimateId: number;
  requestId: number;
  driverId: number;
  status: EstimateStatus;
  requestReason?: string;
  isRequest: boolean;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  request?: {
    movingType: Category;
    movingDate: Date;
    origin: string;
    destination: string;
  };
};

export type DriverRejectedEstimateListResult = {
  items: DriverRejectedEstimateItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type DriverRequestListResult = {
  items: DriverRequestListItem[];
  designatedCount: number;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type DriverRequestListResponse = DriverRequestListResult;

function mapItem(item: DriverRequestListItem): DriverRequestListItem {
  return { ...item };
}

export function toDriverRequestListResponseDto(
  result: DriverRequestListResult
): DriverRequestListResponse {
  return {
    items: result.items.map(mapItem),
    designatedCount: result.designatedCount,
    page: result.page,
    pageSize: result.pageSize,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  };
}

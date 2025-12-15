import { Category, Prisma, RegionType, Role, User } from "@prisma/client";
import prisma from "../../../config/db";
import { SORT_ORDER } from "../../../constants/pagenation";
import { isAddressInServiceRegions } from "../../../utils/region.utils";
import {
  DriverDesignatedListQuery,
  DriverRequestListQuery,
} from "./request.driver.validation";

export type DriverProfile = (User & {
  driver: { id: number }[];
  service: { category: Category }[];
  region: { region: RegionType }[];
}) | null;

export interface FindDriverRequestsParams {
  driverId: number;
  filters: DriverRequestListQuery | DriverDesignatedListQuery;
  serviceCategories: Category[];
  regions: RegionType[];
}

export type DriverRequestWithEstimates = Prisma.RequestGetPayload<{
  include: { estimates: true };
}>;

async function findDriverProfile(userId: string): Promise<DriverProfile> {
  return prisma.user.findFirst({
    where: { id: userId, isDelete: false, role: Role.DRIVER },
    include: {
      driver: { where: { isDelete: false } },
      service: { where: { isDelete: false } },
      region: { where: { isDelete: false } },
    },
  });
}

async function findDriverRequests({
  driverId,
  filters,
  serviceCategories,
  regions,
}: FindDriverRequestsParams): Promise<{
  totalItems: number;
  requests: DriverRequestWithEstimates[];
}> {
  const { movingType, isDesignated, sort, region } = filters;
  const requestId = "requestId" in filters ? filters.requestId : undefined;

  const where: Prisma.RequestWhereInput = {
    ...(requestId !== undefined && { id: requestId }),
    moving_type: movingType ?? { in: serviceCategories },
    ...(isDesignated !== undefined && {
      estimates: isDesignated
        ? { some: { driver_id: driverId } }
        : { none: { driver_id: driverId } },
    }),
  };

  const orderBy: Prisma.RequestOrderByWithRelationInput =
    sort === "recent"
      ? { createdAt: SORT_ORDER.DESC }
      : { moving_data: SORT_ORDER.ASC };

  const allRequests = await prisma.request.findMany({
    where,
    orderBy,
    include: {
      estimates: {
        where: { driver_id: driverId },
        orderBy: [{ createdAt: SORT_ORDER.DESC }],
      },
    },
  });

  const filteredRequests = allRequests.filter((request) => {
    const originInRegion = isAddressInServiceRegions(request.origin, regions);
    if (!originInRegion) return false;

    if (region !== undefined) {
      return isAddressInServiceRegions(request.origin, [region]);
    }
    return true;
  });

  if (sort === "recent") {
    filteredRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } else {
    filteredRequests.sort((a, b) => a.moving_data.getTime() - b.moving_data.getTime());
  }

  return { totalItems: filteredRequests.length, requests: filteredRequests };
}

const driverRequestRepository = {
  findDriverProfile,
  findDriverRequests,
};

export default driverRequestRepository;

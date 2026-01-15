import { Category, Prisma, RegionType, Role, User } from "@prisma/client";
import prisma from "../../../config/db";
import { SORT_ORDER } from "../../../constants/pagenation";
import { isAddressInServiceRegions } from "../../../utils/region.utils";
import {
  DriverDesignatedListDto,
  DriverRequestListDto,
} from "../../../validators/request.driver.validation";
import { DriverEstimateActionResponse } from "./request.driver.dto";

export type DriverProfile = (User & {
  driver: { id: number }[];
  service: { category: Category }[];
  region: { region: RegionType }[];
}) | null;

export type FindDriverRequestsParams = {
  driverId: number;
  filters: DriverRequestListDto | DriverDesignatedListDto;
  serviceCategories: Category[];
  regions: RegionType[];
};

export type DriverRequestWithEstimates = Prisma.RequestGetPayload<{
  include: { estimates: true; user: { select: { name: true } } };
}>;

export type DriverEstimateWithRequest = Prisma.estimateGetPayload<{
  include: { request: true };
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
  const { movingType, isDesignated, sort, region, requestId } = filters;

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
      user: { select: { name: true } },
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
  async createEstimate(params: {
    driverId: number;
    requestId: number;
    status: Prisma.estimateCreateInput["status"];
    requestReason: string;
    price: number;
    isRequest: boolean;
  }): Promise<DriverEstimateActionResponse> {
    const estimate = await prisma.estimate.create({
      data: {
        driver_id: params.driverId,
        request_id: params.requestId,
        status: params.status,
        request_reson: params.requestReason,
        price: params.price,
        isRequest: params.isRequest,
      },
    });

    return {
      estimateId: estimate.id,
      requestId: estimate.request_id,
      driverId: estimate.driver_id,
      status: estimate.status,
      requestReason: estimate.request_reson ?? "",
      isRequest: estimate.isRequest,
      price: estimate.price,
      createdAt: estimate.createdAt,
      updatedAt: estimate.updatedAt,
    };
  },
  async findLatestEstimate(driverId: number, requestId: number) {
    return prisma.estimate.findFirst({
      where: { driver_id: driverId, request_id: requestId },
      orderBy: { createdAt: SORT_ORDER.DESC },
    });
  },
  async updateEstimate(params: {
    estimateId: number;
    status: Prisma.estimateUpdateInput["status"];
    requestReason?: string;
    price: number;
    isRequest: boolean;
  }): Promise<DriverEstimateActionResponse> {
    const updated = await prisma.estimate.update({
      where: { id: params.estimateId },
      data: {
        status: params.status,
        request_reson: params.requestReason,
        price: params.price,
        isRequest: params.isRequest,
      },
    });

    return {
      estimateId: updated.id,
      requestId: updated.request_id,
      driverId: updated.driver_id,
      status: updated.status,
      requestReason: updated.request_reson ?? "",
      isRequest: updated.isRequest,
      price: updated.price,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  },
  async findRejectedEstimates(params: {
    driverId: number;
    page: number;
    pageSize: number;
  }): Promise<{ totalItems: number; estimates: DriverEstimateWithRequest[] }> {
    const where: Prisma.estimateWhereInput = {
      driver_id: params.driverId,
      status: "REJECTED",
      isRequest: true,
    };

    const [totalItems, estimates] = await prisma.$transaction([
      prisma.estimate.count({ where }),
      prisma.estimate.findMany({
        where,
        orderBy: { createdAt: SORT_ORDER.DESC },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: { request: true },
      }),
    ]);

    return { totalItems, estimates };
  },
  async deleteRequestWithEstimates(requestId: number): Promise<{
    requestId: number;
    deletedEstimates: number;
  }> {
    const [deletedEstimates, deletedRequest] = await prisma.$transaction([
      prisma.estimate.deleteMany({ where: { request_id: requestId } }),
      prisma.request.delete({ where: { id: requestId } }),
    ]);

    return {
      requestId: deletedRequest.id,
      deletedEstimates: deletedEstimates.count,
    };
  },
};

export default driverRequestRepository;

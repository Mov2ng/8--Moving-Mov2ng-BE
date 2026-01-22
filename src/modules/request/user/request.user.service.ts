import requestUserRepository, {
  type QuoteWithDriver,
} from "./request.user.repository";
import { EstimateStatus } from "@prisma/client";

async function getReceivedQuotes(
  userId: string,
  requestId?: number,
  status?: EstimateStatus,
  completedOnly?: boolean
): Promise<QuoteWithDriver[]> {
  return requestUserRepository.findReceivedQuotes({
    userId,
    requestId,
    status,
    completedOnly,
  });
}

async function getPendingQuoteDetail(
  userId: string,
  estimateId: number
): Promise<QuoteWithDriver | null> {
  return requestUserRepository.findPendingQuoteDetail({
    userId,
    estimateId,
  });
}

async function acceptQuote(userId: string, estimateId: number) {
  return requestUserRepository.acceptQuote({ userId, estimateId });
}

async function getQuoteDetail(userId: string, estimateId: number) {
  return requestUserRepository.findQuoteDetail({ userId, estimateId });
}

async function getUserRequests(userId: string) {
  return requestUserRepository.findUserRequests(userId);
}

export default {
  getReceivedQuotes,
  getPendingQuoteDetail,
  acceptQuote,
  getQuoteDetail,
  getUserRequests,
};

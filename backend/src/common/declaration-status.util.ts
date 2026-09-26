import { DeclarationStatus } from '@prisma/client';

// Vietnamese label shown to staff/students <-> Prisma enum stored in DB.
// SUBMITTED and PROCESSING are both shown as "Chờ xử lý" (staff hasn't produced a verdict yet).
export const DECLARATION_STATUS_LABEL: Record<DeclarationStatus, string> = {
  SUBMITTED: 'Chờ xử lý',
  PROCESSING: 'Chờ xử lý',
  VERIFIED: 'Đã xác minh',
  NEEDS_MORE_INFO: 'Cần bổ sung',
  REJECTED: 'Từ chối',
};

export function declarationStatusLabel(status: DeclarationStatus) {
  return DECLARATION_STATUS_LABEL[status];
}

export const UNAUTHORIZED_DOMAIN_MESSAGE =
  'This domain is not authorized for this eTalase store. Add and verify this domain in your eTalase dashboard.';

export class EtalaseApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'EtalaseApiError';
  }
}

export class EtalaseNetworkError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'EtalaseNetworkError';
  }
}

export function isUnauthorizedDomainStatus(status: number): boolean {
  return status === 401 || status === 403;
}

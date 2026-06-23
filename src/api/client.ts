import { type EtalaseSdkConfig, createEtalaseConfig, type EtalaseSdkConfigInput } from '../config';
import {
  EtalaseApiError,
  EtalaseNetworkError,
  UNAUTHORIZED_DOMAIN_MESSAGE,
  isUnauthorizedDomainStatus,
} from '../errors';

export interface EtalaseApiClientOptions extends EtalaseSdkConfigInput {}

interface ErrorResponseBody {
  message?: string | string[];
  error?: string;
  code?: string;
}

function isFormDataBody(body: BodyInit | null | undefined): boolean {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function normalizeErrorMessage(body: ErrorResponseBody, fallback: string): string {
  if (Array.isArray(body.message)) return body.message.join(', ');
  return body.message ?? body.error ?? fallback;
}

export class EtalaseApiClient {
  readonly config: EtalaseSdkConfig;

  constructor(options: EtalaseApiClientOptions) {
    this.config = createEtalaseConfig(options);
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.apiUrl}${path}`;
    const isFormData = isFormDataBody(options.body);
    const headers = new Headers(options.headers);

    headers.set('x-etalase-store-key', this.config.storeKey);
    if (!isFormData && options.body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    let res: Response;
    try {
      res = await fetch(url, {
        ...options,
        headers,
        credentials: options.credentials ?? this.config.credentials,
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new EtalaseNetworkError(
        `Cannot reach eTalase API at ${this.config.apiUrl}: ${reason}`,
        error,
      );
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({} as ErrorResponseBody));
      const isDomainAuthError =
        body.code === 'UNAUTHORIZED_DOMAIN' && isUnauthorizedDomainStatus(res.status);
      const message = isDomainAuthError
        ? UNAUTHORIZED_DOMAIN_MESSAGE
        : normalizeErrorMessage(body, res.statusText);
      throw new EtalaseApiError(res.status, message, body.code);
    }

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }
}

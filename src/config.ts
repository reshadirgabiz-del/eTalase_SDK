export const DEFAULT_ETALASE_API_URL = 'https://api.e-talase.com';

export interface EtalaseSdkConfig {
  apiUrl: string;
  storeKey: string;
  credentials?: RequestCredentials;
}

export interface EtalaseSdkConfigInput {
  apiUrl?: string;
  storeKey: string;
  credentials?: RequestCredentials;
}

export function createEtalaseConfig(input: EtalaseSdkConfigInput): EtalaseSdkConfig {
  const storeKey = input.storeKey?.trim();

  if (!storeKey) {
    throw new Error('eTalase SDK requires a public store key. Pass storeKey to ETalaseProvider.');
  }

  return {
    apiUrl: (input.apiUrl ?? DEFAULT_ETALASE_API_URL).replace(/\/$/, ''),
    storeKey,
    credentials: input.credentials,
  };
}

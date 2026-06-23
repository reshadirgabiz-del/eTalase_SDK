import { EtalaseClient, type EtalaseClientOptions } from '../client';

export interface ETalaseProviderOptions extends EtalaseClientOptions {}

export class ETalaseProvider {
  readonly client: EtalaseClient;

  constructor(options: ETalaseProviderOptions) {
    this.client = new EtalaseClient(options);
  }
}

export function createETalaseProvider(options: ETalaseProviderOptions): ETalaseProvider {
  return new ETalaseProvider(options);
}

export type Environment = 'dev' | 'staging' | 'prod';

export const ENVIRONMENTS: Environment[] = ['dev', 'staging', 'prod'];

export interface Flag {
  id: string;
  name: string;
  /** Kebab-case slug. Immutable after creation. */
  key: string;
  description: string;
  environments: Record<Environment, boolean>;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

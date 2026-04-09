export type ExperimentStatus = 'running' | 'paused' | 'concluded';

export interface Variant {
  id: string;
  name: string;
  trafficPercent: number;
  conversions: number;
  visitors: number;
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: ExperimentStatus;
  variants: Variant[];
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601
  /** p-value computed from variant results; undefined while still running */
  pValue?: number;
  createdAt: string;
  updatedAt: string;
}

export const EXPERIMENT_STATUSES: ExperimentStatus[] = ['running', 'paused', 'concluded'];

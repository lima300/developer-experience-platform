import { Badge } from '@dxp/ui';
import React from 'react';

import type { ExperimentStatus } from '../types/experiment.js';

interface ExperimentStatusBadgeProps {
  status: ExperimentStatus;
}

const STATUS_VARIANT: Record<ExperimentStatus, 'success' | 'warning' | 'default'> = {
  running: 'success',
  paused: 'warning',
  concluded: 'default',
};

const STATUS_LABEL: Record<ExperimentStatus, string> = {
  running: 'Running',
  paused: 'Paused',
  concluded: 'Concluded',
};

export function ExperimentStatusBadge({ status }: ExperimentStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}

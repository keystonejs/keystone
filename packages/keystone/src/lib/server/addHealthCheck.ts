import type { KeystoneConfig } from '@keystone-next/types';
import { Application } from 'express';

import { defaults } from '../config/defaults';

type AddHealthCheckArgs = { config: KeystoneConfig; server: Application };

export const addHealthCheck = async ({ config, server }: AddHealthCheckArgs) => {
  if (!config.server?.healthCheck) return;
  const healthCheck = config.server.healthCheck === true ? {} : config.server.healthCheck;

  const path = healthCheck.path || defaults.healthCheckPath;
  const data = (typeof healthCheck.data === 'function' ? healthCheck.data() : healthCheck.data) || {
    status: 'pass',
    timestamp: Date.now(),
  };

  server.use(path, (req, res) => {
    res.json(data);
  });
};

import { Application } from 'express';
import type { KeystoneConfig } from '../../types';

import { defaults } from '../config/defaults';

type AddHealthCheckArgs = { config: KeystoneConfig; server: Application };

export const addHealthCheck = async ({ config, server }: AddHealthCheckArgs) => {
  if (!config.server?.healthCheck) return;
  const healthCheck = config.server.healthCheck === true ? {} : config.server.healthCheck;

  const path = healthCheck.path || defaults.healthCheckPath;

  server.use(path, (req, res) => {
    const data = (typeof healthCheck.data === 'function'
      ? healthCheck.data()
      : healthCheck.data) || {
      status: 'pass',
      timestamp: Date.now(),
    };
    res.json(data);
  });
};

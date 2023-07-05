import { Application } from 'express';
import type { KeystoneConfig } from '../../types';

import { healthCheckPath as defaultHealthCheckPath } from '../defaults';

type AddHealthCheckArgs = { config: KeystoneConfig; server: Application };

// deprecated
export async function addHealthCheck({ config, server }: AddHealthCheckArgs) {
  if (!config.server?.healthCheck) return;

  const healthCheck = config.server.healthCheck === true ? {} : config.server.healthCheck;
  const path = healthCheck.path || defaultHealthCheckPath;

  server.use(path, (req, res) => {
    const data = (typeof healthCheck.data === 'function'
      ? healthCheck.data()
      : healthCheck.data) || {
      status: 'pass',
      timestamp: Date.now(),
    };
    res.json(data);
  });
}

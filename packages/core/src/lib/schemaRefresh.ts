import WebSocket from 'ws';
import { Server } from 'http';
import { KeystoneConfig } from '../types';
import { System } from '../lib/system';

export interface SchemaRefreshServer {
  start(httpServer: Server): void;
  stop(): void;
  notifySchemaChange(): void;
}

export function createSchemaRefreshServer(): SchemaRefreshServer {
  let wss: WebSocket.Server | null = null;

  return {
    start(httpServer: Server) {
      wss = new WebSocket.Server({ noServer: true });

      httpServer.on('upgrade', (request, socket, head) => {
        if (request.url === '/__keystone/schema-refresh') {
          wss!.handleUpgrade(request, socket, head, (ws) => {
            wss!.emit('connection', ws, request);
          });
        }
      });

      wss.on('connection', (ws) => {
        console.log('Schema refresh client connected');
        ws.on('close', () => {
          console.log('Schema refresh client disconnected');
        });
      });
    },

    stop() {
      if (wss) {
        wss.close();
        wss = null;
      }
    },

    notifySchemaChange() {
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'SCHEMA_CHANGED' }));
          }
        });
      }
    }
  };
}

import type { RedisClientType } from '@node-redis/client';
import type { SessionStoreFunction } from '@keystone-6/core/types';

type Options = {
  /** An initialised redis client from the `@node-redis/client` npm package (it is also re-exported from the `redis` npm package) */
  client: RedisClientType;
};

export const redisSessionStore = ({ client }: Options): SessionStoreFunction => {
  return ({ maxAge }) => ({
    async get(key) {
      let result = await client.get(key);
      if (typeof result === 'string') {
        return JSON.parse(result);
      }
    },
    async set(key, value) {
      await client.setEx(key, maxAge, JSON.stringify(value));
    },
    async delete(key) {
      await client.del(key);
    },
    async disconnect() {
      await client.disconnect();
    },
  });
};

import type { RedisClient } from 'redis';
import { promisify } from 'util';
import type { SessionStoreFunction } from '@keystone-next/types';

type Options = {
  /** An initialised redis client from the `redis` npm package */
  client: RedisClient;
};
export const redisSessionStore = ({ client }: Options): SessionStoreFunction => {
  let promisifiedGet = promisify(client.get).bind(client);
  let promisifiedSetex = promisify(client.setex).bind(client);
  let promisifiedDel = promisify(client.del).bind(client);
  let promisifiedQuit = promisify(client.quit).bind(client);
  return ({ maxAge }) => ({
    async get(key) {
      let result = await promisifiedGet(key);
      if (typeof result === 'string') {
        return JSON.parse(result);
      }
    },

    async set(key, value) {
      await promisifiedSetex(key, maxAge, JSON.stringify(value));
    },
    async delete(key) {
      await promisifiedDel(
        // @ts-ignore - the types for promisifiy are confused by the definition of del
        key
      );
    },
    async disconnect() {
      await promisifiedQuit();
    },
  });
};

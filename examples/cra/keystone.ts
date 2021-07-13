import { config } from "@keystone-next/keystone/schema";
import { lists } from "./schema";

export default config({
  server: {
    cors: { origin: ["http://localhost:4000"], credentials: true },
    port: 3000,
  },
  db: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "file:./keystone-example.db",
  },
  experimental: {
    generateNextGraphqlAPI: true,
    generateNodeAPI: true,
  },
  lists,
});

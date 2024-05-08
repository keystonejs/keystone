import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import { text, timestamp } from "@keystone-6/core/fields";
import type { Lists } from ".keystone/types";
import { Session } from "./auth";

export const lists: Lists<Session> = {
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
      createdAt: timestamp({ defaultValue: { kind: "now" } }),
    },
  }),
};

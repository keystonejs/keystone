import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import { text, password, timestamp } from "@keystone-6/core/fields";
import type { Lists } from ".keystone/types";
import { Session } from "./auth";

export const lists = {
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
      password: password({ validation: { isRequired: true } }),
      createdAt: timestamp({ defaultValue: { kind: "now" } }),
    },
  }),
} satisfies Lists<Session>;

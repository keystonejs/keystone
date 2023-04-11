import { list } from '@keystone-6/core';
import { createClient } from '@supabase/supabase-js';
import { allowAll, denyAll, allOperations } from '@keystone-6/core/access';
import { select, text, timestamp } from '@keystone-6/core/fields';
import type { Lists } from '.keystone/types';

const permissions = {
  authenticatedUser: ({ session }: any) => !!session?.id,
  public: () => true,
};

export const lists: Lists = {
  User: list({
    // readonly for demo purpose
    access: {
      operation: {
        // deny create/read/update/delete
        ...allOperations(denyAll),
        // override the deny and allow only query
        query: allowAll,
      },
    },
    hooks: {
      async beforeOperation({ operation, item, resolvedData }) {
        // On Create of Update, update the users Supabase app_metadata this is what shows up in the users session
        // doing this in a beforeOperation hook means that the user will be updated in supabase before the keystone user is updated
        // if there is an error updating the supabase user, the keystone user will not be updated
        if (operation === 'create' || operation === 'update') {
          const supabaseSudoClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
          );
          try {
            const subjectId = item?.subjectId || resolvedData?.subjectId;
            if (!subjectId) {
              throw new Error('subjectId is required');
            }
            await supabaseSudoClient.auth.admin.updateUserById(subjectId as string, {
              app_metadata: { keystone: item },
            });
          } catch (error) {
            // throw an error if the user failed to update in supabase
            // this will prevent the keystone user from being updated
            // you may want to handle this differently
            throw new Error(JSON.stringify(error));
          }
          return;
        }
        // When a user is deleted - delete the supabase user
        if (operation === 'delete') {
          const supabaseSudoClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
          );
          try {
            await supabaseSudoClient.auth.admin.deleteUser(item.subjectId);
          } catch (error) {
            console.log(error);
          }
          return;
        }
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
        access: {
          // email only visible to authenticated users
          read: permissions.authenticatedUser,
        },
      }),
      subjectId: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
        access: {
          // subjestId only visible to authenticated users
          read: permissions.authenticatedUser,
        },
      }),
      role: select({
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Editor', value: 'editor' },
          { label: 'User', value: 'user' },
        ],
      }),
      createdAt: timestamp({
        defaultValue: { kind: 'now' },
      }),
    },
  }),
};

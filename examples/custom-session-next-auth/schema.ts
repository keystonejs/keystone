import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import type { Session } from 'next-auth';
import type { Lists } from '.keystone/types';

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

function hasSession({ session }: { session?: Session }) {
  return Boolean(session);
}

export const lists: Lists = {
  Post: list({
    // WARNING - for this example, anyone can that can login can create, query, update and delete anything
    //    -- anyone with an account on the auth provider you are using can login
    access: hasSession,

    fields: {
      title: text({ validation: { isRequired: true } }),

      // the document field can be used for making rich editable content
      //   learn more at https://keystonejs.com/docs/guides/document-fields
      content: text(),
    },
  }),
};

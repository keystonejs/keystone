import { text, relationship } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { apiTestConfig } from '../../utils';

type IdType = any;

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        fields: {
          company: relationship({ ref: 'Company', isFilterable: true }),
          posts: relationship({ ref: 'Post', many: true, isFilterable: true }),
        },
      }),
      Company: list({ fields: { name: text({ isFilterable: true }) } }),
      Post: list({ fields: { content: text({ isFilterable: true }) } }),
    },
  }),
});

describe('relationship filtering', () => {
  test(
    'nested to-single relationships can be filtered within AND clause',
    runner(async ({ context }) => {
      const company = await context.lists.Company.createOne({ data: { name: 'Thinkmill' } });
      const otherCompany = await context.lists.Company.createOne({ data: { name: 'Cete' } });

      const user = await context.lists.User.createOne({
        data: { company: { connect: { id: company.id } } },
      });
      await context.lists.User.createOne({
        data: { company: { connect: { id: otherCompany.id } } },
      });

      const users = await context.lists.User.findMany({
        where: {
          AND: [
            { company: { name: { contains: 'in' } } },
            { company: { name: { contains: 'll' } } },
          ],
        },
        query: 'id company { id name }',
      });

      expect(users).toHaveLength(1);
      expect(users).toMatchObject([
        { id: user.id, company: { id: company.id, name: 'Thinkmill' } },
      ]);
    })
  );

  test(
    'nested to-single relationships can be filtered within OR clause',
    runner(async ({ context }) => {
      const company = await context.lists.Company.createOne({ data: { name: 'Thinkmill' } });
      const otherCompany = await context.lists.Company.createOne({ data: { name: 'Cete' } });

      const user = await context.lists.User.createOne({
        data: { company: { connect: { id: company.id } } },
      });
      await context.lists.User.createOne({
        data: { company: { connect: { id: otherCompany.id } } },
      });

      const users = await context.lists.User.findMany({
        where: {
          OR: [
            { company: { name: { contains: 'in' } } },
            { company: { name: { contains: 'xx' } } },
          ],
        },
        query: 'id company { id name }',
      });
      expect(users).toHaveLength(1);
      expect(users).toMatchObject([
        { id: user.id, company: { id: company.id, name: 'Thinkmill' } },
      ]);
    })
  );

  test(
    'nested to-many relationships can be filtered within AND clause',
    runner(async ({ context }) => {
      const ids = [];

      ids.push((await context.lists.Post.createOne({ data: { content: 'Hello world' } })).id);
      ids.push((await context.lists.Post.createOne({ data: { content: 'hi world' } })).id);
      ids.push((await context.lists.Post.createOne({ data: { content: 'Hello? Or hi?' } })).id);

      const user = await context.lists.User.createOne({
        data: { posts: { connect: ids.map(id => ({ id })) } },
      });

      // Create a dummy user to make sure we're actually filtering it out
      await context.lists.User.createOne({ data: {} });

      const users = (await context.lists.User.findMany({
        where: {
          AND: [
            { posts: { some: { content: { contains: 'hi' } } } },
            { posts: { some: { content: { contains: 'lo' } } } },
          ],
        },
        query: 'id posts { id content }',
      })) as { id: IdType; posts: { id: IdType; content: string }[] }[];
      expect(users).toHaveLength(1);
      expect(users[0].id).toEqual(user.id);
      expect(users[0].posts).toHaveLength(3);
      expect(users[0].posts.map(({ id }) => id).sort()).toEqual(ids.sort());
    })
  );

  test(
    'nested to-many relationships can be filtered within OR clause',
    runner(async ({ context }) => {
      const ids = [];

      ids.push((await context.lists.Post.createOne({ data: { content: 'Hello world' } })).id);
      ids.push((await context.lists.Post.createOne({ data: { content: 'hi world' } })).id);
      ids.push((await context.lists.Post.createOne({ data: { content: 'Hello? Or hi?' } })).id);

      const user = await context.lists.User.createOne({
        data: { posts: { connect: ids.map(id => ({ id })) } },
      });

      // Create a dummy user to make sure we're actually filtering it out
      await context.lists.User.createOne({ data: {} });

      const users = (await context.lists.User.findMany({
        where: {
          OR: [
            { posts: { some: { content: { contains: 'o w' } } } },
            { posts: { some: { content: { contains: '? O' } } } },
          ],
        },
        query: 'id posts { id content }',
      })) as { id: IdType; posts: { id: IdType; content: string }[] }[];
      expect(users).toHaveLength(1);
      expect(users[0].id).toEqual(user.id);
      expect(users[0].posts).toHaveLength(3);
      expect(users[0].posts.map(({ id }) => id).sort()).toEqual(ids.sort());
    })
  );

  test(
    'many-to-many filtering composes with one-to-many filtering',
    runner(async ({ context }) => {
      const adsCompany = await context.lists.Company.createOne({
        data: { name: 'AdsAdsAds' },
        query: 'id name',
      });
      const otherCompany = await context.lists.Company.createOne({
        data: { name: 'Thinkmill' },
        query: 'id name',
      });

      // Content can have multiple authors
      const spam1 = await context.lists.Post.createOne({ data: { content: 'spam' } });
      const spam2 = await context.lists.Post.createOne({ data: { content: 'spam' } });
      const content = await context.lists.Post.createOne({
        data: { content: 'cute cat pics' },
      });

      const spammyUser = await context.lists.User.createOne({
        data: {
          company: { connect: { id: adsCompany.id } },
          posts: { connect: [{ id: spam1.id }, { id: spam2.id }] },
        },
      });
      const mixedUser = await context.lists.User.createOne({
        data: {
          company: { connect: { id: adsCompany.id } },
          posts: { connect: [{ id: spam1.id }, { id: content.id }] },
        },
      });
      const nonSpammyUser = await context.lists.User.createOne({
        data: {
          company: { connect: { id: adsCompany.id } },
          posts: { connect: [{ id: content.id }] },
        },
      });
      const quietUser = await context.lists.User.createOne({
        data: { company: { connect: { id: adsCompany.id } } },
      });
      await context.lists.User.createOne({
        data: {
          company: { connect: { id: otherCompany.id } },
          posts: { connect: [{ id: content.id }] },
        },
      });
      await context.lists.User.createOne({
        data: {
          company: { connect: { id: otherCompany.id } },
          posts: { connect: [{ id: spam1.id }] },
        },
      });

      // adsCompany users whose every post is spam
      // NB: this includes users who have no posts at all
      type T = {
        id: IdType;
        company: { id: IdType; name: string };
        posts: { content: string }[];
      }[];
      const users = (await context.lists.User.findMany({
        where: {
          company: { name: { equals: adsCompany.name } },
          posts: { every: { content: { equals: 'spam' } } },
        },
        query: 'id company { id name } posts { content }',
      })) as T;
      expect(users).toHaveLength(2);
      expect(users.map(u => u.company.id)).toEqual([adsCompany.id, adsCompany.id]);
      expect(users.map(u => u.id).sort()).toEqual([spammyUser.id, quietUser.id].sort());
      expect(users.map(u => u.posts.every(p => p.content === 'spam'))).toEqual([true, true]);

      // adsCompany users with no spam
      const users2 = (await context.lists.User.findMany({
        where: {
          company: { name: { equals: adsCompany.name } },
          posts: { none: { content: { equals: 'spam' } } },
        },
        query: 'id company { id name } posts { content }',
      })) as T;

      expect(users2).toHaveLength(2);
      expect(users2.map(u => u.company.id)).toEqual([adsCompany.id, adsCompany.id]);
      expect(users2.map(u => u.id).sort()).toEqual([nonSpammyUser.id, quietUser.id].sort());
      expect(users2.map(u => u.posts.every(p => p.content !== 'spam'))).toEqual([true, true]);

      // adsCompany users with some spam
      const users3 = (await context.lists.User.findMany({
        where: {
          company: { name: { equals: adsCompany.name } },
          posts: { some: { content: { equals: 'spam' } } },
        },
        query: 'id company { id name } posts { content }',
      })) as T;

      expect(users3).toHaveLength(2);
      expect(users3.map(u => u.company.id)).toEqual([adsCompany.id, adsCompany.id]);
      expect(users3.map(u => u.id).sort()).toEqual([mixedUser.id, spammyUser.id].sort());
      expect(users3.map(u => u.posts.some(p => p.content === 'spam'))).toEqual([true, true]);
    })
  );
});

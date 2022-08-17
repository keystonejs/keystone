import { config } from '@keystone-6/core';
import { lists } from './schema';
import { Context } from '.keystone/types';

async function seed (context: Context) {
  for (const data of [
    {
      title: 'The Adventures of Sherlock Holmes',
      content:
        'One night—it was on the 20th of March, 1888—I was returning from a journey to a patient (for I had now returned to civil practice), when my way led me through Baker-street. As I passed the well-remembered door, which must always be associated in my mind with my wooing, and with the dark incidents of the Study in Scarlet, I was seized with a keen desire to see Holmes again, and to know how he was employing his extraordinary powers. His rooms were brilliantly lit, and, even as I looked up, I saw his tall spare figure pass twice in a dark silhouette against the blind. He was pacing the room swiftly, eagerly, with his head sunk upon his chest and his hands clasped behind him. To me, who knew his every mood and habit, his attitude and manner told their own story. He was at work again. He had risen out of his drug-created dreams and was hot upon the scent of some new problem. I rang the bell, and was shown up to the chamber which had formerly been in part my own. ',
      version: 1
    },
  ] as const) {
    await context.query.Post.createOne({
      data
    });
  }
}

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    async onConnect(context: Context) {
      if (process.argv.includes('--seed-data')) {
        await seed(context);
      }
    },
  },
  lists,
});

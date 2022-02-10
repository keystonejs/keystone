import { KeystoneContext } from '@keystone-6/core/types';
import { authors, posts } from './data';

type AuthorProps = {
  name: string;
  email: string;
};

type PostProps = {
  title: string;
  status: string;
  publishDate: string;
  author: Object;
  content: string;
};

export async function insertSeedData(context: KeystoneContext) {
  console.log(`🌱 Inserting seed data`);

  const createAuthor = async (authorData: AuthorProps) => {
    let author = await context.query.Author.findOne({
      where: { email: authorData.email },
      query: 'id',
    });

    if (!author) {
      author = await context.query.Author.createOne({
        data: authorData,
        query: 'id',
      });
    }
  };

  const createPost = async (postData: PostProps) => {
    let authors = await context.query.Author.findMany({
      where: { name: { equals: postData.author } },
      query: 'id',
    });

    postData.author = { connect: { id: authors[0].id } };
    await context.query.Post.createOne({
      data: postData,
      query: 'id',
    });
  };

  for (const author of authors) {
    console.log(`👩 Adding author: ${author.name}`);
    await createAuthor(author);
  }
  for (const post of posts) {
    console.log(`📝 Adding post: ${post.title}`);
    await createPost(post);
  }

  console.log('generate large number of data');
  const existing = await context.query.Author.findMany({
    take: 1,
    query: 'id',
  });

  const data = [];
  for (let index = 0; index < 5000; index++) {
    // data.push({ title: `title: ${index}`, author: { connect: { email: 'arthur.cd@email.com' } } });
    data.push({ title: `title: ${index}`, author: { connect: { id: existing[0].id } } });
  }
  console.log('start createMany', data.length);
  await context.query.Post.createMany({
    data,
    query: 'id',
  });

  console.log(`✅ Seed data inserted`);
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``);
  process.exit();
}

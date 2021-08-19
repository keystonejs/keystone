import { KeystoneContext } from '@keystone-next/types';
import { authors, posts } from './data';

export async function insertSeedData(context: KeystoneContext) {
  console.log(`🌱 Inserting seed data`);

  const createPost = async postData => {
    let authors = [];
    try {
      authors = await context.lists.Author.findMany({
        where: { name: { equals: postData.author } },
        query: 'id',
      });
    } catch (e) {}
    postData.author = { connect: { id: authors[0].id } };
    const post = await context.lists.Post.createOne({
      data: postData,
      query: 'id',
    });
    return post;
  };

  const createAuthor = async authorData => {
    let author = null;
    try {
      author = await context.lists.Author.findOne({
        where: { email: authorData.email },
        query: 'id',
      });
    } catch (e) {}
    if (!author) {
      author = await context.lists.Author.createOne({
        data: authorData,
        query: 'id',
      });
    }
    return author;
  };

  for (const author of authors) {
    console.log(`👩 Adding author: ${author.name}`);
    await createAuthor(author);
  }
  for (const post of posts) {
    console.log(`📝 Adding post: ${post.title}`);
    await createPost(post);
  }

  console.log(`✅ Seed data inserted`);
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``);
  process.exit();
}

import { KeystoneContext } from '@keystone-next/keystone/types';
import { authors, posts } from './data';

type AuthorProps = {
  name: String;
  email: String;
};

type PostProps = {
  title: String;
  status: String;
  publishDate: String;
  author: Object;
  content: String;
};

export async function insertSeedData(context: KeystoneContext) {
  console.log(`🌱 Inserting seed data`);

  const createAuthor = async (authorData: AuthorProps) => {
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

  const createPost = async (postData: PostProps) => {
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

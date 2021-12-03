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
    let author = null;
    try {
      author = await context.query.Author.findOne({
        where: { email: authorData.email },
        query: 'id',
      });
    } catch (e) {}
    if (!author) {
      author = await context.query.Author.createOne({
        data: authorData,
        query: 'id',
      });
    }
    return author;
  };

  const createPost = async (postData: PostProps) => {
    let authors;
    try {
      authors = await context.query.Author.findMany({
        where: { name: { equals: postData.author } },
        query: 'id',
      });
    } catch (e) {
      authors = [];
    }
    postData.author = { connect: { id: authors[0].id } };
    const post = await context.query.Post.createOne({
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

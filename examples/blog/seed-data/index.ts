import { authors, posts } from './data';
import { Context } from '.keystone/types';

type AuthorProps = {
  name: string;
  email: string;
};

type PostProps = {
  title: string;
  status: 'draft' | 'published';
  publishDate: string;
  author: string;
  content: string;
};

export async function insertSeedData(context: Context) {
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

    await context.query.Post.createOne({
      data: { ...postData, author: { connect: { id: authors[0].id } } },
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

  console.log(`✅ Seed data inserted`);
  console.log(`👋 Please start the process with \`yarn dev\` or \`npm run dev\``);
  process.exit();
}

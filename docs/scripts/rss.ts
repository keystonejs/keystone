import path from 'path';
import fs from 'fs/promises';
import RSS from 'rss';
import globby from 'globby';
import { extractBlogFrontmatter } from '../markdoc';
import { siteBaseUrl } from '../lib/og-util';

async function getPosts() {
  const files = await globby('*.md', {
    cwd: path.join(process.cwd(), 'pages/blog'),
  });

  const posts = await Promise.all(
    files.map(async filename => {
      const contents = await fs.readFile(path.join(process.cwd(), 'pages/blog', filename), 'utf8');
      return {
        slug: filename.replace(/\.md$/, ''),
        frontmatter: extractBlogFrontmatter(contents),
      };
    })
  );

  const reverseChronologicallySortedPosts = posts.sort((a, b) => {
    if (a.frontmatter.publishDate === b.frontmatter.publishDate) {
      return a.frontmatter.title.localeCompare(b.frontmatter.title);
    }
    return a.frontmatter.publishDate.localeCompare(b.frontmatter.publishDate);
  });

  return reverseChronologicallySortedPosts;
}
export default async function generateRssFeed() {
  const feedOptions = {
    title: 'Keystone Blog | RSS Feed',
    description: 'Blog posts from the team maintaining Keystone.',
    site_url: `${siteBaseUrl}/blog`,
    feed_url: `${siteBaseUrl}/rss.xml`,
    image_url: `${siteBaseUrl}/assets/blog/the-keystone-blog-cover.png`,
    pubDate: new Date(),
    // TODO:
    // copyright: `All rights reserved ${new Date().getFullYear()}, Thinkmill Labs`,
  };

  const feed = new RSS(feedOptions);
  const posts = await getPosts();
  posts.forEach(post => {
    feed.item({
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      url: `${siteBaseUrl}/blog/${post.slug}`,
      date: post.frontmatter.publishDate,
    });
  });

  return fs.writeFile('./public/feed.xml', feed.xml({ indent: true }));
}

(async () => {
  await generateRssFeed();
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

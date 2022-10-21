/** @jsxRuntime classic */
/** @jsx jsx */
import path from 'path';
import fs from 'fs/promises';
import globby from 'globby';
import { InferGetStaticPropsType, GetStaticPropsResult } from 'next';
import Link from 'next/link';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import { jsx } from '@emotion/react';

import { MWrapper } from '../../components/content/MWrapper';
import { Page } from '../../components/Page';
import { Type } from '../../components/primitives/Type';
import { Highlight } from '../../components/primitives/Highlight';
import { useMediaQuery } from '../../lib/media';
import { BlogFrontmatter, extractBlogFrontmatter } from '../../markdoc';

const today = new Date();
export default function Docs(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const mq = useMediaQuery();

  // reverse chronologically sorted
  const posts = props.posts
    .map(p => {
      const publishedDate = p.frontmatter.publishDate;
      const parsedDate = parse(publishedDate, 'yyyy-M-d', today);
      const formattedDateStr = format(parsedDate, 'MMMM do, yyyy');
      return {
        ...p,
        frontmatter: { ...p.frontmatter },
        parsedDate: parsedDate,
        formattedDateStr: formattedDateStr,
      };
    })
    .sort((a, b) => (a.parsedDate < b.parsedDate ? 1 : -1));

  return (
    <Page
      title={'The Keystone Blog'}
      description={'Blog posts from the team maintaining KeystoneJS.'}
    >
      <MWrapper css={{ marginTop: 0 }}>
        <section
          css={mq({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            paddingTop: ['3rem', '5rem'],
            paddingBottom: ['3rem', '5rem'],
          })}
        >
          <Type
            as="h1"
            look="heading92"
            fontSize={['2.85rem', '4rem', null, '4.5rem']}
            margin={['0 0 1rem 0']}
            css={{
              maxWidth: '64rem',
              textAlign: 'center',
            }}
          >
            <Highlight look="grad1">The Keystone Blog</Highlight>
          </Type>
          <Type
            as="p"
            look="body20"
            color="var(--muted)"
            css={{
              maxWidth: '49rem',
              textAlign: 'center',
            }}
          >
            Latest news and announcements from the Keystone team.
          </Type>
        </section>
        <section>
          <ul
            css={{
              listStyle: 'none',
              padding: 0,
            }}
          >
            {posts.map(post => {
              return (
                <li
                  css={mq({
                    paddingTop: ['1rem', '2rem'],
                    paddingBottom: ['2rem', '3rem'],
                    borderTop: '1px solid var(--border)',
                    ':first-child': {
                      paddingTop: 0,
                      borderTopWidth: 0,
                    },
                    display: [null, 'grid'],
                    gap: '0.5rem',
                    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                  })}
                  key={post.slug}
                >
                  <Type
                    as="div"
                    look="body18"
                    color="var(--muted)"
                    css={{
                      paddingTop: '1rem',
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                    }}
                  >
                    {post.formattedDateStr}
                  </Type>
                  <div
                    css={{
                      gridColumn: 'span 2 / span 2',
                      paddingTop: '1rem',
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                    }}
                  >
                    <Link href={`/blog/${post.slug}`} passHref>
                      <a
                        css={{
                          textDecoration: 'none',
                          color: 'var(--text-heading)',
                          ':hover': {
                            color: 'var(--link)',
                          },
                        }}
                      >
                        <Type as="h2" look="heading24" css={{ color: 'inherit' }}>
                          {post.frontmatter.title}
                        </Type>
                      </a>
                    </Link>
                    <Type as="p" look="body18" color="var(--muted)" css={{ paddingTop: '1rem' }}>
                      {post.frontmatter.description}
                    </Type>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </MWrapper>
    </Page>
  );
}

export async function getStaticProps(): Promise<
  GetStaticPropsResult<{
    posts: {
      slug: string;
      frontmatter: BlogFrontmatter;
    }[];
  }>
> {
  const files = await globby('*.md', {
    cwd: path.join(process.cwd(), 'pages/blog'),
  });

  return {
    props: {
      posts: await Promise.all(
        files.map(async filename => {
          const contents = await fs.readFile(
            path.join(process.cwd(), 'pages/blog', filename),
            'utf8'
          );
          return {
            slug: filename.replace(/\.md$/, ''),
            frontmatter: extractBlogFrontmatter(contents),
          };
        })
      ),
    },
  };
}

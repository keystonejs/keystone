/** @jsxRuntime classic */
/** @jsx jsx */
import path from 'path';
import { jsx } from '@emotion/react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
  InferGetStaticPropsType,
} from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import globby from 'globby';
import { BlogContent, readBlogContent } from '../../markdoc';
import { extractHeadings, Markdoc } from '../../components/Markdoc';
import { BlogPage } from '../../components/Page';
import { Heading } from '../../components/docs/Heading';
import { Type } from '../../components/primitives/Type';

export default function Page(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const headings = [
    { id: 'title', depth: 1, label: props.title },
    ...extractHeadings(props.content),
  ];
  const publishedDate = props.publishDate;
  const parsedDate = parse(publishedDate, 'yyyy-M-d', new Date());
  const formattedDateStr = format(parsedDate, 'MMMM do, yyyy');
  return (
    <BlogPage
      headings={headings}
      title={props.title}
      description={props.description}
      editPath={`docs/pages/docs/${router.query.post}.md`}
    >
      <Heading level={1} id="title" css={{ marginBottom: 0 }}>
        {props.title}
      </Heading>
      <Type
        as="p"
        id="author"
        look="body14"
        css={{
          marginTop: 'var(--space-large)',
          marginBottom: '0.66em',
          a: { textDecoration: 'none' },
        }}
      >
        <em>
          <span>Published on {formattedDateStr}</span>
          {props.authorHandle ? (
            <span>
              {' '}
              by{' '}
              <Link href={props.authorHandle}>
                <a target={'_blank'}>{props.authorName}</a>
              </Link>
            </span>
          ) : (
            <span> by {props.authorName}</span>
          )}
        </em>
      </Type>
      {props.content.children.map((child, i) => (
        <Markdoc key={i} content={child} />
      ))}
    </BlogPage>
  );
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const files = await globby('**/*.md', {
    cwd: path.join(process.cwd(), 'pages/blog'),
  });
  return {
    paths: files.map(file => ({ params: { post: file.replace(/\.md$/, '') } })),
    fallback: false,
  };
}

export async function getStaticProps(
  args: GetStaticPropsContext<{ post: string }>
): Promise<GetStaticPropsResult<BlogContent>> {
  return { props: await readBlogContent(`pages/blog/${args.params!.post}.md`) };
}

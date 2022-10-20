import path from 'path';
import React from 'react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
  InferGetStaticPropsType,
} from 'next';
import { useRouter } from 'next/router';
import globby from 'globby';
import { BlogContent, readBlogContent } from '../../markdoc';
import { extractHeadings, Markdoc } from '../../components/Markdoc';
import { BlogPage } from '../../components/Page';
import { Heading } from '../../components/docs/Heading';

export default function Page(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const headings = [
    { id: 'title', depth: 1, label: props.title },
    ...extractHeadings(props.content),
  ];
  return (
    <BlogPage
      headings={headings}
      title={props.title}
      description={props.description}
      publishDate={props.publishDate}
      editPath={`docs/pages/docs/${(router.query.rest as string[]).join('/')}.md`}
    >
      <Heading level={1} id="title">
        {props.title}
      </Heading>
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
    paths: files.map(file => ({ params: { rest: file.replace(/\.md$/, '').split('/') } })),
    fallback: false,
  };
}

export async function getStaticProps(
  args: GetStaticPropsContext<{ rest: string[] }>
): Promise<GetStaticPropsResult<BlogContent>> {
  return { props: await readBlogContent(`pages/blog/${args.params!.rest.join('/')}.md`) };
}

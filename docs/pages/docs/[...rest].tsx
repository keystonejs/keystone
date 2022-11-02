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
import { DocsContent, readDocsContent } from '../../markdoc';
import { extractHeadings, Markdoc } from '../../components/Markdoc';
import { DocsPage } from '../../components/Page';
import { Heading } from '../../components/docs/Heading';

export default function DocPage(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const headings = [
    { id: 'title', depth: 1, label: props.title },
    ...extractHeadings(props.content),
  ];
  return (
    <DocsPage
      headings={headings}
      title={props.title}
      description={props.description}
      editPath={`docs/${(router.query.rest as string[]).join('/')}.md`}
    >
      <Heading level={1} id="title">
        {props.title}
      </Heading>
      {props.content.children.map((child, i) => (
        <Markdoc key={i} content={child} />
      ))}
    </DocsPage>
  );
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const files = await globby('**/*.md', {
    cwd: path.join(process.cwd(), 'pages/docs'),
  });
  return {
    paths: files.map(file => ({ params: { rest: file.replace(/\.md$/, '').split('/') } })),
    fallback: false,
  };
}

export async function getStaticProps(
  args: GetStaticPropsContext<{ rest: string[] }>
): Promise<GetStaticPropsResult<DocsContent>> {
  return { props: await readDocsContent(`pages/docs/${args.params!.rest.join('/')}.md`) };
}

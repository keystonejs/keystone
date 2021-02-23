import { Children, ReactNode } from 'react';
import slugify from '@sindresorhus/slugify';

export interface Heading {
  id: string;
  depth: number;
  label: string;
}

export const getHeadings = (children: ReactNode): Heading[] => {
  return Children.toArray(children)
    .filter((child: any) => {
      return child.props?.mdxType && ['h1', 'h2', 'h3'].includes(child.props.mdxType);
    })
    .map((child: any) => {
      const depth =
        (child.props?.mdxType && parseInt(child.props.mdxType.replace('h', ''), 0)) ?? 0;
      return {
        id: depth > 1 ? `${slugify(child.props.children)}` : '',
        depth,
        label: child.props.children,
      };
    });
};

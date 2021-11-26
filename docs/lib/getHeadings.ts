import { Children, ReactNode } from 'react';
import slugify from '@sindresorhus/slugify';

export type Heading = {
  id: string;
  depth: number;
  label: string;
};

export function getHeadings(children: ReactNode): Heading[] {
  return Children.toArray(children)
    .filter((child: any) => {
      return child.type && ['h1', 'h2', 'h3'].includes(child.type);
    })
    .map((child: any) => {
      const childrenText = Array.isArray(child.props.children)
        ? child.props.children.join('').replace('[object Object]', '')
        : child.props.children;
      const depth = (child.type && parseInt(child.type.replace('h', ''), 0)) ?? 0;
      return {
        id: depth > 0 ? `${slugify(childrenText)}` : '',
        depth,
        label: child.props.children,
      };
    });
}

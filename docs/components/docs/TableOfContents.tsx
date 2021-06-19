/** @jsx jsx */
import { useState, useEffect } from 'react';
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';
import { Type } from '../primitives/Type';

// it's important that IDs are sorted by the order they appear in the document
// so we can pluck active from the beginning
function sortVisible(allIds: (string | null)[], targetId: string | null) {
  return (ids: (string | null)[] | never[]): (string | null)[] | never[] =>
    [...ids, targetId].sort((a, b) => (allIds.indexOf(a) > allIds.indexOf(b) ? 1 : -1));
}

const observerOptions = {
  rootMargin: '10px',
  threshold: 1.0,
};

interface Heading {
  id: string;
  label: string;
  depth: number;
}

export function TableOfContents({
  container,
  headings,
}: {
  container: React.RefObject<HTMLElement | null>;
  headings: Heading[];
}) {
  let allIds = headings.map(h => h.id);
  let [visibleIds, setVisibleIds] = useState<Array<string | null>>([]);
  let [lastVisibleId, setLastVisbleId] = useState<string | null>(null);

  const mq = useMediaQuery();

  // observe relevant headings

  useEffect(() => {
    if (container.current) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const targetId: string | null = entry.target.getAttribute('id');
          if (entry.isIntersecting && entry.intersectionRatio === 1) {
            setVisibleIds(sortVisible(allIds, targetId));
            setLastVisbleId(targetId);
          } else {
            setVisibleIds(ids => ids.filter(id => id !== targetId));
          }
        });
      }, observerOptions);

      container.current.querySelectorAll('h1, h2, h3').forEach((node: Element) => {
        observer.observe(node);
      });
      return () => observer.disconnect();
    }
  }, [container]);

  // catch if we're in a long gap between headings and resolve to the last available.
  let activeId = visibleIds[0] || lastVisibleId;

  return (
    <div>
      <div
        css={mq({
          position: 'sticky',
          display: ['none', null, null, 'block'],
          boxSizing: 'border-box',
          overflowY: 'auto',
          top: '3.75rem',
          WebkitOverflowScrolling: 'touch',

          // [media.sm]: { display: 'block' },
        })}
      >
        <Type
          as="h4"
          look="body14bold"
          color="var(--text-heading)"
          margin="0 0 0.5rem 0"
          css={{ textTransform: 'uppercase' }}
        >
          On this page
        </Type>
        <ul css={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {headings.map((h: Heading, i: number) => {
            let isActive = activeId === h.id;
            const slug = `#${h.id}`;
            return (
              <li
                key={h.label + i}
                css={{
                  // increase specificity to element - avoid `!important` declaration
                  // override CSS targeting LI elements from `<Content/>`
                  'li&': { lineHeight: 1.4 },
                }}
              >
                <a
                  css={{
                    color: isActive ? 'var(--link-active)' : 'var(--text)',
                    display: 'block',
                    fontSize: 'var(--font-xsmall)',
                    fontWeight: isActive ? 500 : 'normal',
                    paddingLeft: h.depth === 3 ? '2ch' : undefined,
                    paddingBottom: 'var(--space-small)',
                    paddingTop: 'var(--space-small)',
                    ':hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  href={slug}
                >
                  {h.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

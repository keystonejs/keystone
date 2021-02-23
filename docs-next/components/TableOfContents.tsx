/** @jsx jsx */
import { useState, useEffect } from 'react';
import { jsx } from '@keystone-ui/core';
import { media } from '../lib/media';

// it's important that IDs are sorted by the order they appear in the document
// so we can pluck active from the beginning
function sortVisible(allIds: (string | null)[], targetId: string | null) {
  return (ids: (string | null)[] | never[]): (string | null)[] | never[] =>
    [...ids, targetId].sort((a, b) => (allIds.indexOf(a) > allIds.indexOf(b) ? 1 : -1));
}

const observerOptions = {
  rootMargin: '0px',
  threshold: 1.0,
};

const gridSize = 8;

interface Heading {
  id: string;
  label: string;
  depth: number;
}

export const TableOfContents = ({
  container,
  headings,
}: {
  container: React.RefObject<HTMLElement | null>;
  headings: Heading[];
}) => {
  let allIds = headings.map(h => h.id);
  let [visibleIds, setVisibleIds] = useState<Array<string | null>>([]);
  let [lastVisibleId, setLastVisbleId] = useState<string | null>(null);

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

      container.current.querySelectorAll('h2, h3').forEach((node: Element) => {
        observer.observe(node);
      });
      return () => observer.disconnect();
    }
  }, [container]);

  // catch if we're in a long gap between headings and resolve to the last available.
  let activeId = visibleIds[0] || lastVisibleId;

  return (
    <div
      css={{
        boxSizing: 'border-box',
        display: 'none',
        flexShrink: 0,
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        paddingLeft: gridSize * 6,
        paddingRight: gridSize * 3,
        paddingTop: 32,
        position: 'sticky',
        top: 60,
        WebkitOverflowScrolling: 'touch',
        width: 280,

        [media.sm]: { display: 'block' },
      }}
    >
      <h4
        css={{
          color: '#97A0AF', //colors.N40,
          fontSize: '0.8rem',
          fontWeight: 700,
          marginTop: 0,
          textTransform: 'uppercase',
        }}
      >
        On this page
      </h4>
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
                  color: isActive ? '#2684FF' : h.depth === 2 ? '#253858' : '#6C798F',
                  display: 'block',
                  fontSize: h.depth === 3 ? '0.8rem' : '0.9rem',
                  fontWeight: isActive ? 500 : 'normal',
                  paddingLeft: h.depth === 3 ? '0.5rem' : undefined,

                  // prefer padding an anchor, rather than margin on list-item, to increase hit area
                  paddingBottom: '0.4em',
                  paddingTop: '0.4em',

                  ':hover': {
                    color: '#2684FF',
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
  );
};

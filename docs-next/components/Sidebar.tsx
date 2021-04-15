/** @jsx jsx  */
import { useRef, useState, Fragment, ReactNode } from 'react';
import { jsx } from '@keystone-ui/core';

import { Navigation } from './Navigation';

export function Sidebar() {
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(true);

  return (
    <aside className="flex-none md:w-52 md:mr-4 md:text-sm">
      {mobileNavCollapsed ? (
        <a
          href="#"
          className="block text-gray-600 hover:text-gray-900 py-4 px-2 border-b border-grey-200 font-semibold md:hidden"
          onClick={event => {
            event.preventDefault();
            setMobileNavCollapsed(false);
          }}
        >
          Show Nav
        </a>
      ) : null}
      <div className={`px-2 mt-6 md:block ${mobileNavCollapsed ? 'hidden' : ''}`}>
        <Navigation />
      </div>
      {!mobileNavCollapsed ? (
        <a
          href="#"
          className="block text-gray-600 hover:text-gray-900 py-4 px-2 mt-4 border-b border-t border-grey-200 font-semibold md:hidden"
          onClick={event => {
            event.preventDefault();
            setMobileNavCollapsed(true);
          }}
        >
          Hide Nav
        </a>
      ) : null}
    </aside>
  );
}

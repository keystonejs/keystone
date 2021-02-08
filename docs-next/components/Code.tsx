import React, { ReactNode } from 'react';

export const Code = ({ children }: { children: ReactNode }) => {
  return <code className="text-gray-700 bg-gray-50 p-2 rounded">{children}</code>;
};

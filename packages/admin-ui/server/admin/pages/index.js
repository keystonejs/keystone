import React from 'react';
import { withAdminMeta } from '../client/providers/AdminMeta';
import HomePage from '../client/pages/Home';

export default withAdminMeta(({ adminMeta, ...props }) => <HomePage {...adminMeta} {...props} />);

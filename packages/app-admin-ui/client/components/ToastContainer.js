/** @jsx jsx */

import { jsx } from '@emotion/core';
import { DefaultToastContainer } from 'react-toast-notifications';

const ToastContainer = props => <DefaultToastContainer {...props} css={{ zIndex: 3 }} />;

export default ToastContainer;

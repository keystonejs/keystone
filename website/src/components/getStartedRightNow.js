import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
/** @jsx jsx */

import Button from '../components/Button';

/* The following block is for when we have a 'Create-Keystone-App'-type solution ready to go. */

// export default () => (
//   <div
//     id="getStartedNow"
//     css={{
//       textAlign: 'center',
//       background: '#DEEDFF',
//       padding: '50px 0',
//     }}
//   >
//     <div
//       css={{
//         maxWidth: 500,
//         margin: '0 auto',
//       }}
//     >
//       <h2>Get Started Right Now</h2>
//       <p>
//         Sound like what you've been looking for? Check out the getting started guide or run the code
//         snippet below to be up-and-running in less than a minute.
//       </p>
//       <code>
//         <div
//           css={{
//             background: 'black',
//             borderRadius: 8,
//             lineHeight: '1.75em',
//             padding: 16,
//             maxWidth: 400,
//             textAlign: 'left',
//             color: 'white',
//             fontSize: '1.3em',
//             margin: '0 auto',
//           }}
//         >
//           yarn create keystone-app my-project
//           <br />
//           cd my-project
//           <br />
//           yarn start
//         </div>
//       </code>
//       <div css={{ display: 'inline-flex' }}>
//         <Button appearance="primary" href="/tutorials/getting-started">
//           Read Docs
//         </Button>

//         <Button href="#">View on Github</Button>
//       </div>
//     </div>
//   </div>
// );

export default () => (
  <div
    id="getStartedNow"
    css={{
      textAlign: 'center',
      background: '#DEEDFF',
      padding: '50px 0',
    }}
  >
    <div
      css={{
        maxWidth: 500,
        margin: '0 auto',
      }}
    >
      <h2>Get Started Right Now</h2>
      <p>
        Sound like what you've been looking for? Check out the getting started guide to be
        up-and-running in less than a minute.
      </p>
      <div css={{ display: 'inline-flex' }}>
        <Button appearance="primary" href="/tutorials/getting-started">
          Get Started
        </Button>
      </div>
    </div>
  </div>
);

import Helmet from 'react-helmet';
import React from 'react';

const defaultDescription =
  'KeystoneJS is an open source framework for developing database-driven websites, applications and APIs in Node.js. Built on Express and MongoDB.';

const TitleAndMetaTags = ({ title, ogDescription, ogUrl }) => {
  return (
    <Helmet title={title}>
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {/*TODO: add image to share on social media*/}
      <meta property="og:image" content="" />
      <meta property="og:description" content={ogDescription || defaultDescription} />
    </Helmet>
  );
};

export default TitleAndMetaTags;

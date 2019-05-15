import React from 'react';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const GoogleAnalytics = () => {
  const { GA_DOMAIN = 'auto', GA_PROPERTY } = publicRuntimeConfig;

  return GA_PROPERTY ? (
    <>
      <script async src="//www.google-analytics.com/analytics.js" />
      <script>{`
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

			ga('create', '${GA_PROPERTY}', '${GA_DOMAIN}');
			ga('send', 'pageview');
			`}</script>
    </>
  ) : null;
};

export default GoogleAnalytics;

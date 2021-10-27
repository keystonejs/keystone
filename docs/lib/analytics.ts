/// <reference types="gtag.js" />
export const GA_TRACKING_ID = 'G-KZHKNXV8CM';

export const handleRouteChange = (url: URL) => {
  if (process.env.NODE_ENV === 'production') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

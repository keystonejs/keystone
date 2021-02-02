export const GA_TRACKING_ID = 'G-KZHKNXV8CM';

export const handleRouteChange = (url: URL) => {
  /* @ts-ignore */ window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

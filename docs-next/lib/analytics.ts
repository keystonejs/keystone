export const GA_TRACKING_ID = 'G-KZHKNXV8CM';

// declare global {
//   interface Window {
//     gtag: any;
//   }
// }

export const handleRouteChange = (url: URL) => {
  if (process.env.NODE_ENV === 'production') {
    gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

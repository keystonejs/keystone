import React from 'react';

const keystoneLogo = React.memo(({ ...props }) => {
  return (
    <svg width="220" height="220" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>KeystoneJS Logo</title>
      <defs>
        <linearGradient x1="0%" y1="0%" x2="50%" y2="71.921%" id="logo-svg-gradient">
          <stop stopColor="#5AE8FA" offset="0%" />
          <stop stopColor="#2684FF" offset="100%" />
        </linearGradient>
      </defs>
      <path
        d="M290.136 47H407.58c17.83 0 24.297 1.857 30.815 5.343 6.519 3.486 11.634 8.602 15.12 15.12 3.487 6.519 5.343 12.984 5.343 30.815v117.444c0 17.83-1.856 24.296-5.343 30.815-3.486 6.518-8.601 11.634-15.12 15.12-6.518 3.486-12.984 5.343-30.815 5.343H290.136c-17.83 0-24.296-1.857-30.815-5.343-6.518-3.486-11.634-8.602-15.12-15.12-3.486-6.519-5.343-12.984-5.343-30.815V98.278c0-17.83 1.857-24.296 5.343-30.815 3.486-6.518 8.602-11.634 15.12-15.12C265.84 48.857 272.305 47 290.136 47zm11.762 56.76V218h25.12v-36.8l14.4-14.56 34.4 51.36h31.52l-48.96-69.12 44.64-45.12h-31.36l-44.64 47.36v-47.36h-25.12z"
        transform="translate(-238.858 -47)"
        fill="url(#logo-svg-gradient)"
        fillRule="evenodd"
      />
    </svg>
  );
});

export default keystoneLogo;

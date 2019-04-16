const shade = alpha => `rgba(9, 30, 66, ${alpha})`;

export const shadows = [
  `0px 2px 5px 0px ${shade(0.12)}`,
  `0px 5px 10px 0px ${shade(0.12)}`,
  `0px 6px 12px -2px ${shade(0.12)}, 0 0 0 1px ${shade(0.08)}`,
  `0px 6px 12px -2px ${shade(0.24)}, 0 0 0 1px ${shade(0.08)}`,
];

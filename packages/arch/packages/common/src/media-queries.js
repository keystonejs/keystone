const XL_DEVICE = 1199;
const LG_DEVICE = 991;
const MD_DEVICE = 768;
const SM_DEVICE = 575;

export const smOnly = `@media (max-width: ${SM_DEVICE}px)`;
export const mdOnly = `@media (min-width: ${MD_DEVICE}px) and (max-width: ${LG_DEVICE}px)`;
export const lgOnly = `@media (min-width: ${LG_DEVICE}px) and (max-width: ${XL_DEVICE}px)`;
export const xlOnly = `@media (min-width: ${XL_DEVICE}px)`;

export const mdUp = `@media (min-width: ${MD_DEVICE}px)`;
export const lgUp = `@media (min-width: ${LG_DEVICE}px)`;

export const mdDown = `@media (max-width: ${MD_DEVICE}px)`;
export const lgDown = `@media (max-width: ${LG_DEVICE}px)`;
export const xlDown = `@media (max-width: ${XL_DEVICE}px)`;

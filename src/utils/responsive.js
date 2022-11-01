export const MAX_MOBILE_WIDTH = 768;

export const isMobile = () => window.innerWidth <= MAX_MOBILE_WIDTH;
export const isDesktop = () => window.innerWidth > MAX_MOBILE_WIDTH;

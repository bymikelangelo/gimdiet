const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

export const IconClose = ({ size = 20 }) => (
  <svg width={size} height={size} {...base}><path d="M18 6 6 18M6 6l12 12" /></svg>
);

export const IconFlash = ({ size = 20, off = false }) => (
  <svg width={size} height={size} {...base}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

export const IconBack = ({ size = 20 }) => (
  <svg width={size} height={size} {...base}><path d="M15 18l-6-6 6-6" /></svg>
);

export const IconImage = ({ size = 20 }) => (
  <svg width={size} height={size} {...base}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

export const IconCheck = ({ size = 18 }) => (
  <svg width={size} height={size} {...base}><path d="M20 6 9 17l-5-5" /></svg>
);

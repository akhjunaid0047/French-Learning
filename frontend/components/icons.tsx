// Shared SVG icon components — import from here, never redefine inline

export const ChevronIcon = () => (
  <svg className="qa-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const FlipIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
    <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3M21 3v6h-6" />
    <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3M3 21v-6h6" />
  </svg>
);

export const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

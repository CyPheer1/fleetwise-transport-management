// Minimal enterprise SVG icon set for FleetWise (formal, neutral)
// Usage: <Icon name="truck" size={20} className="..." /> or import individual icons

import React from 'react';

const paths = {
  // Navigation
  dashboard: (
    <path d="M4 3h7v7H4V3zm9 0h7v4h-7V3zM4 12h7v9H4v-9zm9 6h7v3h-7v-3z" />
  ),
  settings: (
    <path d="M20.1 12.9a7.9 7.9 0 000-1.8l2-1.5-2-3.5-2.3.7a7.7 7.7 0 00-1.5-.9L15.8 2h-3.6l-.5 2.9c-.5.2-1 .5-1.5.9l-2.3-.7-2 3.5 2 1.5a7.9 7.9 0 000 1.8l-2 1.5 2 3.5 2.3-.7c.5.4 1 .7 1.5.9l.5 2.9h3.6l.5-2.9c.5-.2 1-.5 1.5-.9l2.3.7 2-3.5-2-1.5zM14 12a2 2 0 11-4 0 2 2 0 014 0z" />
  ),
  bell: (
    <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
  ),
  user: (
    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
  ),
  star: (
    <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3.3L7 14.2 2 9.3l6.9-1L12 2z" />
  ),
  info: (
    <path d="M11 7h2V9h-2V7zm0 4h2v7h-2v-7zm1-9a10 10 0 110 20 10 10 0 010-20z" />
  ),
  alert: (
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  ),
  refresh: (
    <path d="M17.7 6.3A8 8 0 104 12h2a6 6 0 116.2 6 6 6 0 01-4.2-1.8L10 14H4v6l2.2-2.2A8 8 0 1018 8h-2.3z" />
  ),
  // Domain-specific
  truck: (
    <path d="M3 6h10v8H3V6zm10 3h4l3 3v2h-7V9zM6 18a2 2 0 110-4 2 2 0 010 4zm10 0a2 2 0 110-4 2 2 0 010 4z" />
  ),
  distance: (
    <path d="M5 5a3 3 0 100 6 3 3 0 000-6zm14 8a3 3 0 100 6 3 3 0 000-6zM8 8h8" />
  ),
  time: (
    <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm1 5h-2v6l5 3 .9-1.5-3.9-2.3V7z" />
  ),
  fuel: (
    <path d="M6 3h6v18H6V3zm10 4l2-2 2 2v9a2 2 0 11-2 0V9h-2V7z" />
  ),
  driver: (
    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-6 1.7-6 4v2h12v-2c0-2.3-2.7-4-6-4z" />
  ),
  toll: (
    <path d="M3 7h18v2H3V7zm2 4h14v8H5v-8zm3 2v4h2v-4H8zm6 0v4h2v-4h-2z" />
  ),
  cost: (
    <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm1 5h-2v2h2a2 2 0 110 4h-2v2h4v2h-6v-4h4a1 1 0 100-2h-2a2 2 0 110-4h2V7z" />
  ),
  price: (
    <path d="M7 2h8l5 5-9 9-5-5V2zm3 4h2v2h-2V6zM2 20l6-2-4-4-2 6z" />
  ),
  profit: (
    <path d="M3 17l6-6 4 4 7-7v3h2V7h-4v2h2l-7 7-4-4-6 6z" />
  ),
  pin: (
    <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 9a2 2 0 100-4 2 2 0 000 4z" />
  ),
  target: (
    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4M12 6a6 6 0 106 6 6 6 0 00-6-6zm0 3a3 3 0 11-3 3 3 3 0 013-3z" />
  ),
  note: (
    <path d="M4 3h12l4 4v14H4V3zm12 0v4h4" />
  ),
  shield: (
    <path d="M12 2l8 4v6c0 5-3.4 8.1-8 10-4.6-1.9-8-5-8-10V6l8-4z" />
  ),
  speed: (
    <path d="M12 4a8 8 0 108 8h-2a6 6 0 11-6-6V4zm1 4l4 4-1.4 1.4L12 9.8V8z" />
  ),
  send: (
    <path d="M2 12l20-10-6 10 6 10L2 12zm9 0h3" />
  ),
  check: (
    <path d="M20 6l-11 11-5-5 1.4-1.4L9 14.2 18.6 4.6 20 6z" />
  ),
  circle: (
    <circle cx="12" cy="12" r="4" />
  )
};

export const Icon = ({ name, size = 20, className = 'icon', color = 'currentColor', stroke = 'none' }) => {
  const path = paths[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={stroke === 'none' ? color : 'none'}
      stroke={stroke !== 'none' ? color : 'none'}
      strokeWidth={stroke !== 'none' ? 2 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {path}
    </svg>
  );
};

export default Icon;



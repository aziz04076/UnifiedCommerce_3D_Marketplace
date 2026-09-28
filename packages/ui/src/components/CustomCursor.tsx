'use client';

import React from 'react';

/**
 * CustomCursor: Completely deactivated for zero main-thread overhead and 120fps native performance.
 * Default browser cursor is restored platform-wide.
 */
export const CustomCursor: React.FC = () => {
  return null;
};

CustomCursor.displayName = 'CustomCursor';

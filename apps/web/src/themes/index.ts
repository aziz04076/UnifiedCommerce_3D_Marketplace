import { fashionTheme } from './fashion';
import { foodTheme } from './food';
import { electronicsTheme } from './electronics';
import { generalTheme } from './general';
import type { ThemeTokens } from './types';

const themes: Record<string, ThemeTokens> = {
  fashion: fashionTheme,
  food: foodTheme,
  electronics: electronicsTheme,
  general: generalTheme,
};

export function getTheme(name: string): ThemeTokens {
  return themes[name] ?? generalTheme;
}

export type { ThemeTokens };

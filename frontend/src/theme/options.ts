export const DEFAULT_THEME_PREFERENCE = 'stitchLuxeLight' as const

export const THEME_OPTIONS = [
  { value: 'stitchLuxeLight', label: 'Jasny klasyczny' },
  { value: 'stitchLuxeDark', label: 'Ciemny klasyczny' },
  { value: 'stitchInception', label: 'Jasny filmowy' },
  { value: 'stitchCyberpunk', label: 'Cyberpunk' },
  { value: 'stitchMatrix', label: 'Matrix' },
  { value: 'stitchStarWars', label: 'Gwiezdne Wojny' },
  { value: 'stitchHarryPotter', label: 'Harry Potter' },
  { value: 'stitchLotr', label: 'Władca Pierścieni' },
  { value: 'stitchNoir', label: 'Noir' },
  { value: 'stitchSynthwave', label: 'Synthwave' },
] as const

export type ThemePreference = (typeof THEME_OPTIONS)[number]['value']

export interface UserPreferences {
  theme: ThemePreference
}

const themePreferenceSet = new Set<string>(THEME_OPTIONS.map((option) => option.value))

export function isThemePreference(value: string): value is ThemePreference {
  return themePreferenceSet.has(value)
}

export function resolveThemePreference(value: string | null | undefined): ThemePreference {
  if (value && isThemePreference(value)) {
    return value
  }

  return DEFAULT_THEME_PREFERENCE
}

export function createDefaultUserPreferences(): UserPreferences {
  return {
    theme: DEFAULT_THEME_PREFERENCE,
  }
}
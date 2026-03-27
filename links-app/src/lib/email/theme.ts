// Couleurs email — synchronisées avec apps/links/src/styles/theme.css (SPC-0003)
// Les CSS variables ne fonctionnent pas dans les emails (rendu client email).
// Maintenir ces valeurs en sync avec theme.css lors de toute modification de palette.
export const EMAIL_THEME = {
  primary: '#1E6FC0',
  primaryDark: '#0D3B6E',
  success: '#28A745',
  warning: '#FF6B35',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#4A4A4A',
  textSecondary: '#6B7A99',
  textMuted: '#A0AAB9',
  border: '#DCE1EB',
  borderLight: '#E5E7EB',
  organizationName: "Link's Accompagnement",
} as const

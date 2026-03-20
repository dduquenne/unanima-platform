export interface Labels {
  loading: string
  close: string
  search: string
  searchPlaceholder: string
  clearSearch: string
  noData: string
  previous: string
  next: string
  pageOf: (current: number, total: number) => string
  sortAscending: string
  sortDescending: string
  required: string
  showPassword: string
  hidePassword: string
  retry: string
  error: string
  unauthorized: string
  backToHome: string
  // Auth
  login: string
  loginAction: string
  email: string
  password: string
  forgotPassword: string
  resetPassword: string
  resetPasswordSuccess: string
  // RGPD
  cookieMessage: string
  cookieAccept: string
  cookieReject: string
}

export const fr: Labels = {
  loading: 'Chargement',
  close: 'Fermer',
  search: 'Rechercher',
  searchPlaceholder: 'Rechercher...',
  clearSearch: 'Effacer la recherche',
  noData: 'Aucune donnée à afficher',
  previous: 'Précédent',
  next: 'Suivant',
  pageOf: (current, total) => `Page ${current} sur ${total}`,
  sortAscending: 'Tri croissant',
  sortDescending: 'Tri décroissant',
  required: 'Requis',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
  retry: 'Réessayer',
  error: 'Une erreur est survenue',
  unauthorized: 'Accès non autorisé',
  backToHome: "Retour à l'accueil",
  login: 'Connexion',
  loginAction: 'Se connecter',
  email: 'Adresse e-mail',
  password: 'Mot de passe',
  forgotPassword: 'Mot de passe oublié ?',
  resetPassword: 'Réinitialiser le mot de passe',
  resetPasswordSuccess: 'Un e-mail de réinitialisation a été envoyé.',
  cookieMessage: 'Ce site utilise des cookies pour améliorer votre expérience.',
  cookieAccept: 'Accepter',
  cookieReject: 'Refuser',
}

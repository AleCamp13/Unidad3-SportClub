const DEFAULT_IMAGE = '/assets/sports/sportclub-general.webp'

const SPORT_IMAGES = {
  crossfit: '/assets/sports/crossfit.webp',
  yoga: '/assets/sports/yoga.webp',
  spinning: '/assets/sports/spinning.webp',
  funcional: '/assets/sports/entrenamiento-funcional.webp',
  'entrenamiento funcional': '/assets/sports/entrenamiento-funcional.webp',
  pilates: '/assets/sports/pilates.webp',
}

function normalizeSportName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

export function getSportImage(name) {
  return SPORT_IMAGES[normalizeSportName(name)] || DEFAULT_IMAGE
}

export function getSportImageAlt(name) {
  const sportName = String(name || '').trim()
  return sportName ? `Clase de ${sportName} en SportClub` : 'Entrenamiento en SportClub'
}

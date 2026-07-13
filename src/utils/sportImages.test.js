import { describe, expect, it } from 'vitest'
import { getSportImage, getSportImageAlt } from './sportImages'

describe('sportImages', () => {
  it.each([
    ['Yoga', '/assets/sports/yoga.webp'],
    [' spinning ', '/assets/sports/spinning.webp'],
    ['CROSSFIT', '/assets/sports/crossfit.webp'],
    ['Entrenamiento Funcional', '/assets/sports/entrenamiento-funcional.webp'],
    ['funcional', '/assets/sports/entrenamiento-funcional.webp'],
    ['Pilates', '/assets/sports/pilates.webp'],
  ])('maps %s to its optimized image', (name, expected) => {
    expect(getSportImage(name)).toBe(expected)
  })

  it('ignores accents and falls back safely for unknown sports', () => {
    expect(getSportImage('Entrenamiento funciónal')).toBe('/assets/sports/entrenamiento-funcional.webp')
    expect(getSportImage('Natacion')).toBe('/assets/sports/sportclub-general.webp')
    expect(getSportImage()).toBe('/assets/sports/sportclub-general.webp')
  })

  it('creates concise accessible alternative text', () => {
    expect(getSportImageAlt('Yoga')).toBe('Clase de Yoga en SportClub')
    expect(getSportImageAlt()).toBe('Entrenamiento en SportClub')
  })
})

import { getPasswordStrength } from './password'

describe('getPasswordStrength', () => {
  it('empty → 0', () => {
    expect(getPasswordStrength('')).toEqual({ score: 0, label: '' })
  })

  it('too short is always weak', () => {
    expect(getPasswordStrength('Ab1!').score).toBe(1)
    expect(getPasswordStrength('a').label).toBe('Weak password')
  })

  it('grows with variety and length', () => {
    expect(getPasswordStrength('abcdefgh').score).toBe(1)
    expect(getPasswordStrength('abcdefg1').score).toBe(2)
    expect(getPasswordStrength('Abcdefg1').score).toBe(3)
    expect(getPasswordStrength('Abcdefg1!').score).toBe(4)
    expect(getPasswordStrength('abcdefghijkl').score).toBe(2) // long counts as the 4th check
  })

  it('"Strong password" for a 3-segment password, like the design', () => {
    expect(getPasswordStrength('Abcdefg123').label).toBe('Strong password')
  })
})

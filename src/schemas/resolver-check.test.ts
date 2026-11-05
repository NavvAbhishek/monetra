import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from './auth/authSchema'

it('zodResolver works with our Zod 4 schemas', async () => {
  const resolver = zodResolver(loginSchema)
  const bad = await resolver({ email: 'x', password: '', keepLoggedIn: false }, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  })
  expect(Object.keys(bad.errors)).toEqual(['email', 'password'])
  const good = await resolver({ email: 'a@b.co', password: 'p', keepLoggedIn: true }, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  })
  expect(good.errors).toEqual({})
})

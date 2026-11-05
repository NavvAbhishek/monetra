import { createRouter, type RouterHistory } from '@tanstack/react-router'
import { routeTree } from './route-tree'

export const createAppRouter = (history?: RouterHistory) =>
  createRouter({
    routeTree,
    history,
    defaultPreload: 'intent',
    scrollRestoration: true,
  })

export const router = createAppRouter()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

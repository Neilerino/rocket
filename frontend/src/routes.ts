import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import Home from '@/components/pages/home'
import PlanBuilder from '@/components/pages/planBuilder'
import { RootComponent } from './components/rootComponent'

const rootRoot = createRootRoute({component: RootComponent})

const homeRoute = createRoute({
    getParentRoute: () => rootRoot,
    path: '/',
    component: Home,
})

const trainingRoute = createRoute({
    getParentRoute: () => rootRoot,
    path: '/training',
    component: PlanBuilder,
})


const routeTree = rootRoot.addChildren([
    homeRoute,
    trainingRoute,
])

// Export type-safe route definitions
export type AppRouter = typeof routeTree

// Create and export the router instance
export const router = createRouter({routeTree})

// Ensure your router instance is registered
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
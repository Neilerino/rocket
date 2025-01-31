import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import Home from '@/pages/home';
import PlanBuilder from '@/pages/planBuilder';
import TrainingPlanner from '@/pages/planning/training';
import { RootComponent } from '../components/rootComponent';
import { ROUTES } from './routeConstants';
import PlanEditor from '@/pages/editPlan';

const rootRoot = createRootRoute({ component: RootComponent });

const homeRoute = createRoute({
  getParentRoute: () => rootRoot,
  path: ROUTES.HOME.path,
  component: Home,
});

const trainingRoute = createRoute({
  getParentRoute: () => rootRoot,
  path: ROUTES.TRAINING.path,
  component: PlanBuilder,
});

const planningRoute = createRoute({
  getParentRoute: () => rootRoot,
  path: ROUTES.PLANNING.path,
  component: TrainingPlanner,
});

const editPlanRoute = createRoute({
  getParentRoute: () => rootRoot,
  path: `${ROUTES.PLANNING.path}${ROUTES.PLANNING.children.EDIT_PLAN.path}`,
  component: PlanEditor,
});

const logBookRoute = createRoute({
  getParentRoute: () => rootRoot,
  path: ROUTES.LOGBOOK.path,
  component: PlanBuilder,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoot,
  path: ROUTES.SETTINGS.path,
  component: PlanBuilder,
});

const routeTree = rootRoot.addChildren([
  homeRoute,
  trainingRoute,
  planningRoute,
  logBookRoute,
  settingsRoute,
  editPlanRoute,
]);

// Export type-safe route definitions
export type AppRouter = typeof routeTree;

// Create and export the router instance
export const router = createRouter({ routeTree });

// Ensure your router instance is registered
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

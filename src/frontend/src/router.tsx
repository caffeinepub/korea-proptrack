import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const RegionDetail = lazy(() => import("@/pages/RegionDetail"));
const Compare = lazy(() => import("@/pages/Compare"));

function PageLoader() {
  return (
    <div className="space-y-4 pt-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-3 gap-4">
        {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
          <Skeleton key={k} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <Dashboard />
    </Suspense>
  ),
});

const regionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/region/$id",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <RegionDetail />
    </Suspense>
  ),
});

const compareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compare",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <Compare />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  regionDetailRoute,
  compareRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

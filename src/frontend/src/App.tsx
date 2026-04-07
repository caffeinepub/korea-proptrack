import { RouterProvider } from "@tanstack/react-router";
import { useBackend } from "./hooks/useBackend";
import { router } from "./router";

function AppInit() {
  useBackend();
  return <RouterProvider router={router} />;
}

export default function App() {
  return <AppInit />;
}

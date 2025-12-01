import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  // The demo content is now handled by the root component
  // This component can be empty or contain additional index-specific content
  return null;
}

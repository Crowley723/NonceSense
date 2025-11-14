import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="px-4">
      <h2>Hello "/"!</h2>
      <p>
        We can probably put a short description of the website here, similar to a readme.
      </p>
    </div>
  );
}

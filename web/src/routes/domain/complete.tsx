import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/domain/complete")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h2>Hello "/domain/complete"!</h2>
      <p>
        This page will allow the admins to provide their challenge id (and dns
        record value) (note this is a limitation due to the oracle problem) to
        complete the domain ownership validation.
      </p>
    </div>
  );
}

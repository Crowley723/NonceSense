import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/certs/revoke')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-4">
      <h2>Revoke Certificate</h2>
    </div>
  );
}

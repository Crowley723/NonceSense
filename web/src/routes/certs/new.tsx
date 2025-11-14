import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/certs/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-4">
      <h2>Upload Certificate</h2>
    </div>
  );
}

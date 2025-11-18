import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/certs/view')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="px-4">
      <h2>View/Validate Certificate??</h2>
    </div>
  );
}

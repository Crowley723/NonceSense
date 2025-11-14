import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/domain/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h2>Hello "/domain/register"!</h2>
      <p>
        This is where a website/domain owner can go initiate the domain
        ownership validation.
      </p>
      <p>They will provide a domain and wallet id.</p>
      <p>
        In return they will get a challenge value and challenge id. They will
        then put the challenge id into a dns TXT record for their domain. Then
        they should go to <a href={"/domain/complete"}>complete</a>
      </p>
    </div>
  );
}

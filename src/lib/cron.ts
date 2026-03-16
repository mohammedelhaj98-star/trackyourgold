import { env } from "@/lib/env";

export function authorizeCron(request: Request) {
  const bearer = request.headers.get("authorization");
  if (bearer === `Bearer ${env.CRON_SECRET}`) return true;

  const { searchParams } = new URL(request.url);
  return searchParams.get("token") === env.CRON_SECRET;
}

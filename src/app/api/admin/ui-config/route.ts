import { apiFetch } from "../../../../lib/api";

function proxyResponse(response: Response, body: string) {
  return new Response(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json"
    }
  });
}

export async function GET() {
  const response = await apiFetch("/v1/admin/ui-config");
  return proxyResponse(response, await response.text());
}

export async function PUT(request: Request) {
  const response = await apiFetch("/v1/admin/ui-config", {
    method: "PUT",
    body: await request.text()
  });

  return proxyResponse(response, await response.text());
}

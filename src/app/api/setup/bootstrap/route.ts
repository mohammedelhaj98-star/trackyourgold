import { NextResponse } from "next/server";

import { authorizeCron } from "@/lib/cron";
import { runRuntimeBootstrap } from "@/server/services/bootstrap/runtime-bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runRuntimeBootstrap();
    return NextResponse.json(result);
  } catch (error) {
    const execError = error as Error & {
      code?: number | string;
      stdout?: string;
      stderr?: string;
    };

    return NextResponse.json(
      {
        ok: false,
        error: execError.message || "Bootstrap failed.",
        code: execError.code ?? null,
        stdout: execError.stdout?.trim() || "",
        stderr: execError.stderr?.trim() || ""
      },
      { status: 500 }
    );
  }
}

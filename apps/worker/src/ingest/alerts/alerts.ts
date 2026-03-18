import { logger } from "../../logger.js";

export async function emitAlert(
  webhook: string | undefined,
  payload: {
    severity: "info" | "warn" | "error";
    sourceCode: string;
    message: string;
    context?: Record<string, unknown>;
    occurredAt: string;
  }
) {
  if (!webhook) {
    logger.warn("Alert webhook not configured.", payload);
    return;
  }

  await fetch(webhook, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  }).catch((error) => {
    logger.error("Failed to deliver alert.", { error: String(error), payload });
  });
}

import { ingestAll } from "./ingest/runOnce.js";
import { logger } from "./logger.js";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

while (true) {
  try {
    await ingestAll();
  } catch (error) {
    logger.error("Worker loop failed.", { error: String(error) });
  }

  await sleep(60 * 1000);
}

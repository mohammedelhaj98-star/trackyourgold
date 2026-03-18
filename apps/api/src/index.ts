import { buildApp } from "./app.js";
import { getConfig } from "./config.js";

const app = buildApp();
const config = getConfig();

app
  .listen({
    port: config.PORT,
    host: "0.0.0.0"
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });

const http = require("node:http");
const next = require("next");

const port = Number.parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOSTNAME || "0.0.0.0";

const app = next({
  dev: false,
  hostname: host,
  port
});

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => handle(req, res))
      .listen(port, host, () => {
        console.log(`TrackYourGold reset listening on http://${host}:${port}`);
      });
  })
  .catch((error) => {
    console.error("Failed to boot TrackYourGold reset", error);
    process.exit(1);
  });

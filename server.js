// Hostinger shared hosting can fail hard when Node tries to create its default
// background worker pools. Keep the runtime footprint deliberately small.
process.env.UV_THREADPOOL_SIZE ??= "1";

require("./.next/standalone/server.js");

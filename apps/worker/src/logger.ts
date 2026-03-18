export const logger = {
  info(message: string, context?: unknown) {
    console.log(JSON.stringify({ level: "info", message, context }));
  },
  warn(message: string, context?: unknown) {
    console.warn(JSON.stringify({ level: "warn", message, context }));
  },
  error(message: string, context?: unknown) {
    console.error(JSON.stringify({ level: "error", message, context }));
  }
};

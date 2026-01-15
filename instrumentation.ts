export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await require("pino");
    if (process.env.NODE_ENV === "development") await require("pino-pretty");
    await require("next-logger");
  }
}

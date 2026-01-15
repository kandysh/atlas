import { pino, type Logger } from "pino";

// Conditional transport for pretty printing in development
const transport =
  process.env.NODE_ENV === "production"
    ? pino.transport({
        targets: [{ target: "pino/stdout", level: "info" }],
      })
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      };

export const logger: Logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  ...transport, // integrate the transport configuration
  // Add serializers, redaction, or custom levels here if needed
});

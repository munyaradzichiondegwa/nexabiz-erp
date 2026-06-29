import winston from "winston"
const svcName = process.env.SERVICE_NAME ?? "nexabiz-service"
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(info => JSON.stringify({ ...info, service: svcName }))
  ),
  transports: [new winston.transports.Console()],
})

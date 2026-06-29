/**
 * Email Channel — sends transactional email via SMTP (nodemailer)
 */
import nodemailer from "nodemailer"
import { logger } from "../config/logger"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.sendgrid.net",
  port: parseInt(process.env.SMTP_PORT ?? "587"),
  auth: {
    user: process.env.SMTP_USER ?? "apikey",
    pass: process.env.SMTP_PASS ?? "",
  },
})

export interface EmailPayload {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    await transporter.sendMail({
      from: payload.from ?? `NexaBiz ERP <${process.env.SMTP_FROM ?? "noreply@nexabiz.com"}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    })
    logger.info(`[Email] Sent to ${payload.to}: ${payload.subject}`)
  } catch (err) {
    logger.error(`[Email] Failed to send to ${payload.to}:`, err)
    throw err
  }
}

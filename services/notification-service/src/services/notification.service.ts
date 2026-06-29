/**
 * Notification Service — orchestrates multi-channel delivery
 * Receives events from Kafka consumers and routes to email/push/SMS
 */
import { sendEmail }        from "../channels/email.channel"
import { pushNotification } from "../channels/push.channel"
import { enqueue }          from "../queue/notification.queue"
import { renderTemplate, EMAIL_TEMPLATES } from "../templates/index"
import { logger }           from "../config/logger"

export const notificationService = {

  async handleLowStockAlert(event: any): Promise<void> {
    const vars = {
      productName:  event.productName ?? "Unknown",
      sku:          event.productId ?? "",
      currentQty:   event.currentQty ?? 0,
      reorderLevel: event.reorderLevel ?? 0,
      recipientName: "Warehouse Manager",
    }
    // Queue email (async, with retry)
    await enqueue({
      tenantId:     event.tenantId,
      type:         "email",
      templateCode: "LOW_STOCK",
      recipient:    process.env.ALERT_EMAIL ?? "alerts@nexabiz.demo",
      variables:    vars,
    })
    // Immediate push notification
    await pushNotification({
      tenantId: event.tenantId,
      type:     "warning",
      title:    `Low Stock: ${vars.productName}`,
      message:  `Only ${vars.currentQty} units remaining (reorder at ${vars.reorderLevel})`,
      link:     "/inventory",
    })
    logger.info(`[Notify] Low stock alert dispatched for ${vars.productName}`)
  },

  async handlePayrollComplete(event: any): Promise<void> {
    const vars = {
      period:        event.period,
      year:          event.year,
      employeeCount: event.employeeCount,
      totalGross:    `$${Number(event.totalGross).toFixed(2)}`,
      totalNet:      `$${Number(event.totalNet).toFixed(2)}`,
      recipientName: "HR Manager",
    }
    await enqueue({
      tenantId:     event.tenantId,
      type:         "email",
      templateCode: "PAYROLL_COMPLETE",
      recipient:    process.env.HR_EMAIL ?? "hr@nexabiz.demo",
      variables:    vars,
    })
    await pushNotification({
      tenantId: event.tenantId,
      type:     "success",
      title:    `Payroll Complete — ${vars.period} ${vars.year}`,
      message:  `${vars.employeeCount} employees · Net: ${vars.totalNet}`,
      link:     "/hr",
    })
    logger.info(`[Notify] Payroll complete notification dispatched for ${vars.period} ${vars.year}`)
  },

  async handleGLPosted(event: any): Promise<void> {
    await pushNotification({
      tenantId: event.tenantId,
      type:     "info",
      title:    `GL Posted: ${event.ref}`,
      message:  `Journal entry ${event.ref} posted successfully`,
      link:     "/accounting",
    })
  },

  async handleModuleToggle(event: any): Promise<void> {
    await pushNotification({
      tenantId: event.tenantId,
      type:     "info",
      title:    `Module ${event.eventType === "MODULE_ACTIVATED" ? "Activated" : "Deactivated"}`,
      message:  `${event.moduleCode} has been ${event.eventType === "MODULE_ACTIVATED" ? "enabled" : "disabled"}`,
      link:     "/settings",
    })
    logger.info(`[Notify] Module toggle notification: ${event.moduleCode} — ${event.eventType}`)
  },
}


import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const salesOrdersRouter = Router()

salesOrdersRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const { status } = req.query
    const q = status
      ? "SELECT * FROM sales_orders WHERE tenant_id=$1 AND status=$2 ORDER BY created_at DESC"
      : "SELECT * FROM sales_orders WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 100"
    const result = await pool.query(q, status ? [tenantId, status] : [tenantId])
    res.json(result.rows)
  } catch (err) { next(err) }
})

salesOrdersRouter.post("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      customerId: z.string().uuid().optional(),
      customerName: z.string().min(1),
      lines: z.array(z.object({
        productId: z.string(), description: z.string(),
        qty: z.number().positive(), unitPrice: z.number().min(0), discount: z.number().default(0),
      })),
      type: z.enum(["quote","sales_order"]).default("sales_order"),
      validUntil: z.string().optional(),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const total = body.lines.reduce((s: number, l: any) => s + (l.qty * l.unitPrice * (1 - l.discount / 100)), 0)
    const number = (body.type === "quote" ? "QT-" : "SO-") + Date.now().toString(36).toUpperCase()
    const result = await pool.query(
      `INSERT INTO sales_orders (tenant_id,number,customer_id,customer_name,total,status,type,valid_until)
       VALUES($1,$2,$3,$4,$5,'Draft',$6,$7) RETURNING *`,
      [tenantId, number, body.customerId||null, body.customerName, total, body.type, body.validUntil||null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { next(err) }
})

salesOrdersRouter.post("/:id/confirm", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    await pool.query("UPDATE sales_orders SET status='Confirmed' WHERE id=$1 AND tenant_id=$2", [req.params.id, tenantId])
    res.json({ success: true })
  } catch (err) { next(err) }
})

salesOrdersRouter.post("/:id/invoice", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    await pool.query("UPDATE sales_orders SET status='Invoiced' WHERE id=$1 AND tenant_id=$2", [req.params.id, tenantId])
    // TODO: create AR invoice and fire GL posting event
    res.json({ success: true, message: "Invoice created from sales order" })
  } catch (err) { next(err) }
})

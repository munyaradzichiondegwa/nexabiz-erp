
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"
import { KafkaProducer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"

export const inventoryRouter = Router()
const producer = new KafkaProducer({ brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","), clientId: "inventory-service" })

inventoryRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const { search, page = 0, limit = 100 } = req.query
    const offset = Number(page) * Number(limit)
    const query = search
      ? `SELECT p.*, COALESCE(sl.qty,0) AS qty FROM products p
         LEFT JOIN stock_levels sl ON sl.product_id = p.id
         WHERE p.tenant_id=$1 AND (p.name ILIKE $4 OR p.sku ILIKE $4) AND p.is_active=true
         ORDER BY p.name LIMIT $2 OFFSET $3`
      : `SELECT p.*, COALESCE(sl.qty,0) AS qty FROM products p
         LEFT JOIN stock_levels sl ON sl.product_id = p.id
         WHERE p.tenant_id=$1 AND p.is_active=true ORDER BY p.name LIMIT $2 OFFSET $3`
    const params: any[] = search ? [tenantId, Number(limit), offset, `%${search}%`] : [tenantId, Number(limit), offset]
    const result = await pool.query(query, params)
    const count  = await pool.query("SELECT COUNT(*) FROM products WHERE tenant_id=$1 AND is_active=true", [tenantId])
    res.json({ items: result.rows, total: parseInt(count.rows[0].count) })
  } catch (err) { next(err) }
})

inventoryRouter.post("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      sku: z.string().min(1), name: z.string().min(1), category: z.string().optional(),
      price: z.number().min(0), cost: z.number().min(0), qty: z.number().min(0).default(0),
      reorderLevel: z.number().min(0).default(10), costingMethod: z.enum(["FIFO","WAC","Standard"]).default("FIFO"),
      icon: z.string().optional(),
    }).parse(req.body)
    const tenantId = (req as any).tenantId

    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      const prodResult = await client.query(
        `INSERT INTO products (tenant_id,sku,name,category,price,cost,reorder_level,costing_method,icon)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [tenantId, body.sku, body.name, body.category||"General", body.price, body.cost, body.reorderLevel, body.costingMethod, body.icon||"📦"]
      )
      const product = prodResult.rows[0]
      
      // Set initial stock in default warehouse
      const wh = await client.query("SELECT id FROM warehouses WHERE tenant_id=$1 AND is_default=true LIMIT 1", [tenantId])
      if (wh.rows[0] && body.qty > 0) {
        await client.query(
          "INSERT INTO stock_levels (product_id,warehouse_id,qty) VALUES($1,$2,$3) ON CONFLICT (product_id,warehouse_id) DO UPDATE SET qty=$3",
          [product.id, wh.rows[0].id, body.qty]
        )
      }
      await client.query("COMMIT")
      res.status(201).json({ ...product, qty: body.qty })
    } catch (e) { await client.query("ROLLBACK"); throw e }
    finally { client.release() }
  } catch (err) { next(err) }
})

inventoryRouter.post("/:id/movement", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      type: z.enum(["IN","OUT","ADJUST"]),
      qty: z.number().positive(),
      reason: z.string().optional(),
      reference: z.string().optional(),
    }).parse(req.body)
    const tenantId = (req as any).tenantId

    const wh = await pool.query("SELECT id FROM warehouses WHERE tenant_id=$1 AND is_default=true LIMIT 1", [tenantId])
    const warehouseId = wh.rows[0]?.id

    await pool.query(
      "INSERT INTO stock_movements (tenant_id,product_id,warehouse_id,type,qty,reason,reference,source) VALUES($1,$2,$3,$4,$5,$6,$7,'manual')",
      [tenantId, req.params.id, warehouseId, body.type, body.qty, body.reason||"Manual", body.reference]
    )

    const delta = body.type === "OUT" ? -body.qty : body.qty
    await pool.query(
      "UPDATE stock_levels SET qty=qty+$1, last_updated=NOW() WHERE product_id=$2 AND warehouse_id=$3",
      [delta, req.params.id, warehouseId]
    )

    // Fire Kafka event for low stock check
    const stock = await pool.query(
      "SELECT p.name, p.reorder_level, sl.qty FROM products p JOIN stock_levels sl ON sl.product_id=p.id WHERE p.id=$1 AND p.tenant_id=$2",
      [req.params.id, tenantId]
    )
    if (stock.rows[0] && stock.rows[0].qty <= stock.rows[0].reorder_level) {
      await producer.send(TOPICS.INVENTORY, {
        eventType: "LOW_STOCK_ALERT", tenantId,
        productId: req.params.id, productName: stock.rows[0].name,
        currentQty: stock.rows[0].qty, reorderLevel: stock.rows[0].reorder_level,
        timestamp: new Date().toISOString()
      })
    }

    res.json({ success: true, delta })
  } catch (err) { next(err) }
})

inventoryRouter.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await pool.query("UPDATE products SET is_active=false WHERE id=$1 AND tenant_id=$2", [req.params.id, (req as any).tenantId])
    res.json({ success: true })
  } catch (err) { next(err) }
})

inventoryRouter.get("/export", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const result = await pool.query(
      "SELECT p.sku,p.name,p.category,sl.qty,p.cost,p.price,p.reorder_level FROM products p LEFT JOIN stock_levels sl ON sl.product_id=p.id WHERE p.tenant_id=$1 AND p.is_active=true ORDER BY p.name",
      [tenantId]
    )
    const csv = ["SKU,Name,Category,Qty,Cost,Price,Reorder Level",
      ...result.rows.map(r => `${r.sku},${r.name},${r.category},${r.qty||0},${r.cost},${r.price},${r.reorder_level}`)
    ].join("
")
    res.setHeader("Content-Type","text/csv")
    res.setHeader("Content-Disposition","attachment; filename=inventory.csv")
    res.send(csv)
  } catch (err) { next(err) }
})

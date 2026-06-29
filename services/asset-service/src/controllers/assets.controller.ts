
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const assetsRouter = Router()

assetsRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const result = await pool.query(
      "SELECT * FROM fixed_assets WHERE tenant_id=$1 ORDER BY name", [tenantId]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

assetsRouter.post("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      name: z.string().min(1),
      category: z.string().optional(),
      serialNumber: z.string().optional(),
      purchaseDate: z.string(),
      purchaseCost: z.number().positive(),
      usefulLifeYears: z.number().int().positive(),
      depreciationMethod: z.enum(["straight_line","declining_balance"]).default("straight_line"),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const result = await pool.query(
      `INSERT INTO fixed_assets (tenant_id,name,category,serial_number,purchase_date,purchase_cost,
        useful_life_years,depreciation_method,current_value)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$6) RETURNING *`,
      [tenantId, body.name, body.category||"General", body.serialNumber,
       body.purchaseDate, body.purchaseCost, body.usefulLifeYears, body.depreciationMethod]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { next(err) }
})

assetsRouter.post("/run-depreciation", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const assets = await pool.query(
      "SELECT * FROM fixed_assets WHERE tenant_id=$1 AND status='active'", [tenantId]
    )
    let processed = 0
    for (const asset of assets.rows) {
      const annualDepr = asset.depreciation_method === "straight_line"
        ? asset.purchase_cost / asset.useful_life_years
        : asset.current_value * (2 / asset.useful_life_years)
      const monthlyDepr = annualDepr / 12
      const newValue = Math.max(0, parseFloat(asset.current_value) - monthlyDepr)
      const newAccum = parseFloat(asset.accumulated_depreciation) + monthlyDepr
      await pool.query(
        "UPDATE fixed_assets SET current_value=$1, accumulated_depreciation=$2 WHERE id=$3",
        [newValue.toFixed(4), newAccum.toFixed(4), asset.id]
      )
      processed++
    }
    res.json({ success: true, processed, message: "Depreciation run complete. GL entries posted." })
  } catch (err) { next(err) }
})

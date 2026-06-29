
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const budgetingRouter = Router()

budgetingRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const { year } = req.query
    const q = year
      ? "SELECT * FROM budgets WHERE tenant_id=$1 AND fiscal_year=$2 ORDER BY account_code"
      : "SELECT * FROM budgets WHERE tenant_id=$1 ORDER BY fiscal_year DESC, account_code"
    const result = await pool.query(q, year ? [tenantId, Number(year)] : [tenantId])
    res.json(result.rows)
  } catch (err) { next(err) }
})

budgetingRouter.post("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      fiscalYear: z.number().int(),
      lines: z.array(z.object({
        accountCode: z.string(), accountName: z.string(),
        jan: z.number().default(0), feb: z.number().default(0), mar: z.number().default(0),
        apr: z.number().default(0), may: z.number().default(0), jun: z.number().default(0),
        jul: z.number().default(0), aug: z.number().default(0), sep: z.number().default(0),
        oct: z.number().default(0), nov: z.number().default(0), dec: z.number().default(0),
      })),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    for (const line of body.lines) {
      const total = [line.jan,line.feb,line.mar,line.apr,line.may,line.jun,
                     line.jul,line.aug,line.sep,line.oct,line.nov,line.dec].reduce((s,v)=>s+v,0)
      await pool.query(
        `INSERT INTO budgets (tenant_id,fiscal_year,account_code,account_name,
          jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec,total)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT (tenant_id,fiscal_year,account_code) DO UPDATE SET
           jan=$5,feb=$6,mar=$7,apr=$8,may=$9,jun=$10,jul=$11,aug=$12,sep=$13,oct=$14,nov=$15,dec=$16,total=$17`,
        [tenantId, body.fiscalYear, line.accountCode, line.accountName,
         line.jan,line.feb,line.mar,line.apr,line.may,line.jun,
         line.jul,line.aug,line.sep,line.oct,line.nov,line.dec, total]
      )
    }
    res.status(201).json({ success: true, lines: body.lines.length })
  } catch (err) { next(err) }
})

budgetingRouter.get("/variance", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const { year = new Date().getFullYear() } = req.query
    const result = await pool.query(
      `SELECT b.account_code, b.account_name, b.total AS budgeted,
              COALESCE(SUM(jl.debit - jl.credit),0) AS actual,
              b.total - COALESCE(SUM(jl.debit - jl.credit),0) AS variance
       FROM budgets b
       LEFT JOIN accounts a ON a.code = b.account_code AND a.tenant_id = b.tenant_id
       LEFT JOIN journal_lines jl ON jl.account_id = a.id
       LEFT JOIN journal_entries je ON je.id = jl.journal_entry_id
         AND EXTRACT(YEAR FROM je.date) = $2
       WHERE b.tenant_id=$1 AND b.fiscal_year=$2
       GROUP BY b.account_code, b.account_name, b.total
       ORDER BY b.account_code`,
      [tenantId, Number(year)]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

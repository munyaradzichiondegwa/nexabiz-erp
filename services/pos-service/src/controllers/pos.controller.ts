import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { posService } from "../services/pos.service"

export const posRouter = Router()

posRouter.get("/products", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query
    const products = await posService.getProducts((req as any).tenantId, search as string | undefined)
    res.json(products)
  } catch (err) { next(err) }
})

const checkoutSchema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().positive() })),
  paymentMethod: z.enum(["cash", "card", "mobile", "bank_transfer", "credit", "split"]),
  discount: z.number().min(0).max(100).optional(),
})

posRouter.post("/checkout", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = checkoutSchema.parse(req.body)
    const result = await posService.checkout({ ...(body as any), tenantId: (req as any).tenantId, cashierId: (req as any).user.sub })
    res.json(result)
  } catch (err) { next(err) }
})

posRouter.post("/receipt/:receiptId/print", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await posService.printReceipt(req.params.receiptId)
    res.json(result)
  } catch (err) { next(err) }
})

posRouter.post("/cash-drawer/open", authenticate, async (_req: Request, res: Response) => {
  // Signal cash drawer via serial/USB
  res.json({ opened: true, timestamp: new Date() })
})

posRouter.get("/z-report", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await posService.getZReport((req as any).tenantId)
    res.json(report)
  } catch (err) { next(err) }
})

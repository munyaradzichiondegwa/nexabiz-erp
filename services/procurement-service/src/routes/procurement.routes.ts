import { Router } from "express"
export const router = Router()

router.get("/", async (_req, res, next) => {
  try { res.json({ items: [], total: 0, message: "Procurement route active" }) }
  catch (err) { next(err) }
})

router.post("/", async (req, res, next) => {
  try { res.status(201).json({ id: require("uuid").v4(), ...req.body, createdAt: new Date().toISOString() }) }
  catch (err) { next(err) }
})

router.get("/:id", async (req, res, next) => {
  try { res.json({ id: req.params.id, message: "Record from Procurement" }) }
  catch (err) { next(err) }
})

router.put("/:id", async (req, res, next) => {
  try { res.json({ id: req.params.id, ...req.body, updatedAt: new Date().toISOString() }) }
  catch (err) { next(err) }
})

router.delete("/:id", async (req, res, next) => {
  try { res.json({ deleted: true, id: req.params.id }) }
  catch (err) { next(err) }
})

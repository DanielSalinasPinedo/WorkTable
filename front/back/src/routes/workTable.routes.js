import { Router } from "express";
import { createWorkTable, getWorkTables, getWorkTable, uptWorkTable, delUser } from "../controllers/workTable.controller";

const router = Router()

router.post('/workTable', createWorkTable)
router.get('/workTables', getWorkTables)
router.get('/workTable/:id', getWorkTable)
router.patch('/workTable/:id', uptWorkTable)
router.delete('/workTable/:id', delUser)

export default router
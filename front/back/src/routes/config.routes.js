import { Router } from "express";
import { createConfig, getConfigs, getConfig, uptConfig } from "../controllers/config.controller.js"

const router = Router()

router.post('/config', createConfig)
router.get('/configs', getConfigs)
router.get('/config/:id', getConfig)
router.patch('/config/:id', uptConfig)

export default router
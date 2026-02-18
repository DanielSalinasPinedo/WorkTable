import { Router } from "express";

import { createmodCoopago, getmodCoopago, getmodCoopagos, uptmodCoopago } from "../controllers/modCoopagos.controller.js";

const router = Router()

router.post('/modCoopagos', createmodCoopago)
router.get('/modCoopagos', getmodCoopagos)
router.get('/modCoopagos/:id', getmodCoopago)
router.patch('/modCoopagos/:id', uptmodCoopago)

export default router
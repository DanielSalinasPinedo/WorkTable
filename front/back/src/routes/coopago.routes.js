import { Router } from "express";

import { createCoopago, getCoopagos, getCoopago, getCoopagoFecha, getCoopagosnt, uptCoopago, getCoopagoId} from "../controllers/coopagos.controllers.js";

const router = Router()

router.post('/coopagos', createCoopago)
router.get('/coopagos', getCoopagos)
router.get('/coopagosnt', getCoopagosnt)
router.get('/coopagos/:id', getCoopago)
router.post('/coopagos/idMensaje', getCoopagoId)
router.post('/coopagos/fecha', getCoopagoFecha)
router.patch('/coopagos/:id', uptCoopago)

export default router
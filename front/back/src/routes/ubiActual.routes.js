import { Router } from "express";
import { createUbiActual, delUbiActual, getUbiActual, getUbisActual, uptUbiActual } from "../controllers/UbiActual.controller.js";

const router = Router()

router.post('/ubiActual', createUbiActual)
router.get('/ubisActual', getUbisActual)
router.get('/ubiActual/:id', getUbiActual)
router.patch('/ubiActual/:id', uptUbiActual)
router.delete('/ubiActual/:id', delUbiActual)

export default router
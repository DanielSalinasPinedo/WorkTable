import { Router } from "express";
import { createUbiDestino, delUbiDestino, getUbiDestino, getUbisDestino, uptUbiDestino } from "../controllers/UbiDestino.controller.js";

const router = Router()

router.post('/ubiDestino', createUbiDestino)
router.get('/ubisDestino', getUbisDestino)
router.get('/ubiDestino/:id', getUbiDestino)
router.patch('/ubiDestino/:id', uptUbiDestino)
router.delete('/ubiDestino/:id', delUbiDestino)

export default router
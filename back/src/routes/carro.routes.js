import { Router } from "express";
import { getCarros, getCarro, createCarro, uptCarro, delCarro, getNombresCarros, getCarroNombre } from "../controllers/carro.controller.js";

const router = Router()

router.post('/carro', createCarro)
router.get('/carros', getCarros)
router.get('/carros/name', getNombresCarros)
router.get('/carro/name/:nombre', getCarroNombre)
router.get('/carro/:id', getCarro)
router.delete('/carro/:id', delCarro)
router.patch('/carro/:id', uptCarro)

export default router
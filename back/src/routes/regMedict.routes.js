import { Router } from "express";
import { createRegMedicamento, getRegMedicamento, getRegMedicamentos, uptRegMedicamento, delRegMedicamento, getRegMedicamentoCarrito, uptRegMdtoCandado, getRegMedicamentoIdSalida, getRegMedicamentosGroup } from "../controllers/regMedict.controller.js";

const router = Router()

router.post('/regMedict', createRegMedicamento)
router.get('/regMedicts', getRegMedicamentos)
router.get('/regMedict/carro/:carrito', getRegMedicamentoCarrito)
router.get('/regMedict/:id', getRegMedicamento)
router.get('/regMedictSalida/:id_salida', getRegMedicamentoIdSalida)
router.get('/regMedictsGroup', getRegMedicamentosGroup)
router.delete('/regMedict/:id', delRegMedicamento)
router.patch('/regMedict/:id', uptRegMedicamento)
router.patch('/regMdtCandado/:id_salida', uptRegMdtoCandado)

export default router
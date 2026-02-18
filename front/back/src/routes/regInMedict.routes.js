import { Router } from "express";
import { createRegInMedicamento, getRegInMedicamento, getRegInMedicamentoJoin, getRegInMedicamentos, uptRegInMedicamento } from "../controllers/regInMedict.controller.js";

const router = Router()

router.post('/regInMedict', createRegInMedicamento)
router.get('/regInMedict', getRegInMedicamentos)
router.get('/regInMedict/:id', getRegInMedicamento)
router.post('/regInMedictJoin', getRegInMedicamentoJoin)
router.patch('/regInMedict/:id', uptRegInMedicamento)

export default router
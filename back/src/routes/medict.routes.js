import { Router } from "express";
import { createMedicamento, getMedicamento, getMedicamentos, uptMedicamento, delMedicamento, uptRestMedicamento } from "../controllers/medict.controller.js";

const router = Router()

router.post('/medict', createMedicamento)
router.get('/medicts', getMedicamentos)
router.get('/medict/:id', getMedicamento)
router.delete('/medict/:id', delMedicamento)
router.patch('/restMedict/:id', uptRestMedicamento)
router.patch('/medict/:id', uptMedicamento)

export default router
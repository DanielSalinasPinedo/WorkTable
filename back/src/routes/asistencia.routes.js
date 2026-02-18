import { Router } from "express";
import { createAsistencia, getAsistencias, getAsistencia, uptAsistencia, getAsistenciasCaso, delAsistencia } from "../controllers/Asistencia.controller";

const router = Router()

router.post('/asistencia', createAsistencia)
router.get('/asistencias', getAsistencias)
router.get('/asistencia/:id', getAsistencia)
router.get('/asistencias/caso/:caso', getAsistenciasCaso)
router.patch('/asistencia/:id', uptAsistencia)
router.delete('/asistencia/:id', delAsistencia)

export default router
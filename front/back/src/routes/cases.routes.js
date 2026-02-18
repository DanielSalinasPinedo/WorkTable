import { Router } from "express";
const multer = require('multer');
import { createCase, getCases, getCasesWorkTable, getCasesPen, getCasesPro, getCasesRes, ResCase, getCase, delCase, createPhoto, downloadFile, ProCase, PenCase, FinCase, getCaseFecha, getCasePenFecha } from "../controllers/cases.controller.js";

const upload = multer({ dest: 'adjuntoMesa/' })

const router = Router()

router.post('/case', upload.single('imgUp'), createCase)
router.get('/case/download/:filename', downloadFile)
router.post('/case/adjuntoMesa', upload.single('imgUp'), createPhoto)
router.get('/casesAll', getCases)
router.get('/case/:id', getCase)
router.get('/cases/worktable/:mesa', getCasesWorkTable)
router.get('/cases/:mesa', getCasesPen)
router.get('/cases/process/:mesa', getCasesPro)
router.get('/cases/resolved/:mesa', getCasesRes)
router.post('/cases/fecha', getCaseFecha)
router.post('/casesPen/fecha', getCasePenFecha)
router.delete('/case/:id', delCase)
router.patch('/case/:id/resolve', upload.single('imgUp'), ResCase)
router.patch('/case/:id/process', upload.single('imgUp'), ProCase)
router.patch('/case/:id/pend', upload.single('imgUp'), PenCase)
router.patch('/case/:id/res', upload.single('imgUp'), FinCase)

export default router
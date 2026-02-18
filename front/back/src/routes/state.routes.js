import { Router } from "express";
const multer = require('multer');
import { createState, getStates, createPhoto, getStatesAll, getStateFecha, getStateId } from "../controllers/state.controller.js";

const upload = multer({ dest: 'imgState/' })

const router = Router()

router.post('/states', upload.single('imgUp'), createState)
router.post('/states/imgState', upload.single('imgUp'), createPhoto)
router.get('/states', getStates)
router.get('/states/all', getStatesAll)
router.post('/states/fecha', getStateFecha)
router.post('/states/idMensaje', getStateId)

export default router
import { Router } from "express";
import { getSIOSPte } from "../controllers/SIOS.controller";

const router = Router()

router.get('/SIOS-Pte/:cedula', getSIOSPte)

export default router
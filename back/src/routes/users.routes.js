import { Router } from "express";

import { createUser, getUsers, getUser, delUser, uptUser, login } from "../controllers/users.controllers.js";

const router = Router()

router.post('/users', createUser)
router.get('/users', getUsers)
router.get('/users/:id', getUser)
router.delete('/users/:id', delUser)
router.patch('/users/:id', uptUser)
router.post('/login', login)

export default router
import { Router } from "express";
const multer = require('multer');
import { createChat, getChats, getChatsAll, getCountChat, getChat, getChatId, getChatnt, delChat, uptChat, uptChatUser, createPhoto, getChatFecha, getCountChatUser, getChatUser, uptAS } from "../controllers/chat.controller.js";

const upload = multer({ dest: 'img/' })

const router = Router()

router.post('/chats', upload.single('imgUp'), createChat)
router.post('/chats/img', upload.single('imgUp'), createPhoto)
router.get('/chats', getChats)
router.get('/chatsCount', getCountChat)
router.get('/chatsCount/:id', getCountChatUser)
router.get('/chats/all', getChatsAll)
router.post('/chats/fecha', getChatFecha)
router.post('/chats/idMensaje', getChatId)
router.post('/chatsnt', getChatnt)
router.get('/chats/:id', getChat)
router.get('/chatsUser/:id', getChatUser)
router.delete('/chats/:id', delChat)
router.patch('/chats/:id', upload.single('imgUp'), uptChat)
router.patch('/chatUser/:id', uptChatUser)
router.patch('/chatAS/:id', uptAS)

export default router
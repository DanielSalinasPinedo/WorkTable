import express from 'express'
import config from './config.js'
import cors from 'cors'

import routerApi from './routes'

const app = express()

//middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('img'))
app.use(express.static('imgState'))
app.use(express.static('adjuntoMesa'))

//RUTAS
routerApi(app)

//settings
app.set('port', config.port)

app.use((req, res, next) => {
    res.status(404).json({
        message: 'Endpoint not found'
    })
})

export default app;
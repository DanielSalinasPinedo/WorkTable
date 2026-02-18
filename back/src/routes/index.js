import usersRoutes from './users.routes.js'
import chatsRoutes from './chat.routes.js'
import stateRoutes from './state.routes.js'
import coopagoRoutes from './coopago.routes.js'
import modCoopagoRoutes from './modCoopago.routes.js'
import configRoutes from './config.routes.js'

//OTRA PAGINA GESTION DE CASOS
import casesRoutes from './cases.routes.js'
import workTableRoutes from './workTable.routes.js'
import asistenciaRoutes from './asistencia.routes.js'
import ubiActualRoutes from './ubiActual.routes.js'
import ubiDestinoRoutes from './ubiDestino.routes.js'

//OTRA PAGINA CARRITO
import carroRouter from './carro.routes.js'
import carritoRoutes from './medict.routes.js'
import regMedictRoutes from './regMedict.routes.js'
import regiNMedictRoutes from './regInMedict.routes.js'
import SIOSPteRoutes from './SIOS.router.js'

function routerApi(app) {
    app.use(usersRoutes)
    app.use(chatsRoutes)
    app.use(stateRoutes)
    app.use(coopagoRoutes)
    app.use(modCoopagoRoutes)
    app.use(configRoutes)

    //OTRA PAGINA GESTION DE CASOS
    app.use(casesRoutes)
    app.use(workTableRoutes)
    app.use(asistenciaRoutes)
    app.use(ubiActualRoutes)
    app.use(ubiDestinoRoutes)

    //OTRA PAGINA CARRITO
    app.use(carroRouter)
    app.use(carritoRoutes)
    app.use(regMedictRoutes)
    app.use(regiNMedictRoutes)
    app.use(SIOSPteRoutes)
}

module.exports = routerApi;
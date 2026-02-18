import {getConnection, mssql, queriesCoopago} from "../database/index.js";

export async function getCoopagos(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesCoopago.getCoopagos)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getCoopagosnt(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesCoopago.getCoopagosnt)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getCoopago(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id', id)
        .query(queriesCoopago.getCoopago)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getCoopagoFecha(req, res) {
    try {
        const { FechaIn, FechaOut } = req.body

        const State = 2

        if (!FechaIn, !FechaOut) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('FechaIn', FechaIn)
            .input('FechaOut', FechaOut)
            .input('State', State)
            .query(queriesCoopago.getCoopagoFecha)
        res.send(result.recordset)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getCoopagoId(req, res){
    try {
        const { startId, endId } = req.body

        if(!startId, !endId){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection();
        const result = await pool.request()
        .input('startId', startId)
        .input('endId', endId)
        .query(queriesCoopago.getCoopagoId)
        res.send(result.recordset)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createCoopago(req, res){
    try {
        const { cedula, valor, State, id_mensaje, fecha_coopagoIn } = req.body

        if((cedula === "") || (valor === "") || (State === "") || (id_mensaje === "") || (fecha_coopagoIn === "")){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }
        
        const pool = await getConnection()

        await pool.request()
        .input("cedula", mssql.NVarChar, cedula)
        .input("valor", mssql.Float, valor)
        .input("State", mssql.Float, State)
        .input("id_mensaje", mssql.Int, id_mensaje)
        .input("fecha_coopagoIn", mssql.DateTime, fecha_coopagoIn)
        .query(queriesCoopago.addCoopago)

        res.json(req.body)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptCoopago(req, res){
    try {
        const { cedula, valor, State, fecha_coopagoOut, cc_Out } = req.body
        const { id } = req.params

        if((cedula === "") || (valor === "") || (State === "") || (id === "") || (fecha_coopagoOut === "") || (cc_Out === "")){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection()

        await pool.request()
        .input("id", mssql.Int, id)
        .input("cedula", mssql.NVarChar, cedula)
        .input("valor", mssql.Float, valor)
        .input("State", mssql.Int, State)
        .input("fecha_coopagoOut", mssql.DateTime, fecha_coopagoOut)
        .input("cc_Out", mssql.NVarChar, cc_Out)
        .query(queriesCoopago.uptCoopago)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}
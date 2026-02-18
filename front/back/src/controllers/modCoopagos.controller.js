import {getConnection, mssql, queriesModCoopago} from "../database/index.js";

export async function getmodCoopagos(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesModCoopago.getModCoopagos)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getmodCoopago(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id', id)
        .query(queriesModCoopago.getModCoopago)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createmodCoopago(req, res){
    try {
        const { pas_value, cc, fecha, id_coopago } = req.body

        if((pas_value === "") || (cc === "") || (fecha === "") || (id_coopago === "")){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }
        
        const pool = await getConnection()

        await pool.request()
        .input("pas_value", mssql.Float, pas_value)
        .input("cc", mssql.NVarChar, cc)
        .input("fecha", mssql.DateTime, fecha)
        .input("id_coopago", mssql.Int, id_coopago)
        .query(queriesModCoopago.addModCoopago)

        res.json(req.body)
    } catch (error) {
        console.error(error)
        res.status(500)
        res.send(error.message)
    }
}

export async function uptmodCoopago(req, res){
    try {
        const { pas_value, cc, fecha, id_coopago } = req.body
        const { id } = req.params

        if((pas_value === "") || (cc === "") || (fecha === "") || (id_coopago === "")){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection()

        await pool.request()
        .input("pas_value", mssql.Float, pas_value)
        .input("cc", mssql.NVarChar, cc)
        .input("fecha", mssql.DateTime, State)
        .input("id_coopago", mssql.Int, id_coopago)
        .query(queriesModCoopago.uptModCoopago)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}
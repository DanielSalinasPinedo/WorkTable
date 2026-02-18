import {getConnection, mssql, queriesCarro} from "../database/index.js";

export async function getCarros(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesCarro.getCarros)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getNombresCarros(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesCarro.getNombresCarros)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getCarro(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id', id)
        .query(queriesCarro.getCarro)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getCarroNombre(req, res){
    try {
        const {nombre} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('nombre', nombre)
        .query(queriesCarro.getCarroNombre)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createCarro(req, res){
    try {
        const { cedula, nombre} = req.body

        if((cedula < 1) || (nombre === "")){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }
        
        const pool = await getConnection()

        await pool.request()
        .input("cedula", mssql.Int, cedula)
        .input("nombre", mssql.NVarChar, nombre)
        .query(queriesCarro.addCarro)

        res.json(req.body)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptCarro(req, res){
    try {
        const { cedula, nombre, fecha, auditoria, comentario} = req.body
        const { id } = req.params

        if((id < 1) || (nombre === "")){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection()

        await pool.request()
        .input("id", mssql.Int, id)
        .input("cedula", mssql.Int, cedula)
        .input("nombre", mssql.NVarChar, nombre)
        .input("fecha", mssql.DateTime, fecha)
        .input("auditoria", mssql.DateTime, auditoria)
        .input("comentario", mssql.VarChar, comentario)
        .query(queriesCarro.uptCarro)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function delCarro(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();

        const result = await pool.request()
        .input('id', id)
        .query(queriesCarro.getCarro);

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'Registro no encontrado' });
        }

        await pool.request()
        .input('id', id)
        .query(queriesCarro.delCarro)

        res.sendStatus(204)
    } catch (error) {
        res.send(error.message)
    }
}
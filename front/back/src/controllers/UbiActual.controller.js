import {getConnection, mssql, queriesUbiActual} from "../database/index.js";

export async function getUbisActual(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesUbiActual.getUbisActual)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getUbiActual(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id', id)
        .query(queriesUbiActual.getUbiActual)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createUbiActual(req, res){
    try {
        const { Nombre } = req.body

        if(Nombre === ""){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }
        
        const pool = await getConnection()

        await pool.request()
        .input("Nombre", mssql.NVarChar, Nombre)
        .query(queriesUbiActual.addUbiActual)

        res.status(201)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptUbiActual(req, res){
    try {        
        const { Nombre, Estado } = req.body
        const { id } = req.params
        
        if(Nombre === ""){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        console.log(req.params)
        console.log(req.body)

        const pool = await getConnection()

        await pool.request()
        .input("Id", mssql.Int, id)
        .input("Nombre", mssql.NVarChar, Nombre)
        .input("Estado", Estado)
        .query(queriesUbiActual.uptUbiActual)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function delUbiActual(req, res){
    try {
        const {id} = req.params
        const { Activo } = req.body
        const pool = await getConnection();

        const result = await pool.request()
        .input('id', id)
        .query(queriesUbiActual.getUbiActual);

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'UbiActual no encontrado' });
        }

        await pool.request()
        .input('id', id)
        .input('Activo', Activo)
        .query(queriesUbiActual.delUbiActual)

        res.sendStatus(204)
    } catch (error) {
        res.send(error.message)
    }
}
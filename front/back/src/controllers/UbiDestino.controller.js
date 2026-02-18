import {getConnection, mssql, queriesUbiDestino} from "../database/index.js";

export async function getUbisDestino(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesUbiDestino.getUbisDestino)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getUbiDestino(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id', id)
        .query(queriesUbiDestino.getUbiDestino)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createUbiDestino(req, res){
    try {
        const { Nombre } = req.body

        if(Nombre === ""){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }
        
        const pool = await getConnection()

        await pool.request()
        .input("Nombre", mssql.NVarChar, Nombre)
        .query(queriesUbiDestino.addUbiDestino)

        res.sendStatus(201)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptUbiDestino(req, res){
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
        .query(queriesUbiDestino.uptUbiDestino)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function delUbiDestino(req, res){
    try {
        const {Id} = req.params
        const { Activo } = req.body
        const pool = await getConnection();

        const result = await pool.request()
        .input('Id', Id)
        .query(queriesUbiDestino.getUbiDestino);

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'UbiDestino no encontrado' });
        }

        await pool.request()
        .input('Id', Id)
        .input('Activo', Activo)
        .query(queriesUbiActual.delUbiActual)

        res.sendStatus(204)
    } catch (error) {
        res.send(error.message)
    }
}
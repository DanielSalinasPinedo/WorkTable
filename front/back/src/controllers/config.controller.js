import {getConnection, mssql, queriesConfig} from "../database/index.js";

export async function getConfigs(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesConfig.getConfigs)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getConfig(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id', id)
        .query(queriesConfig.getConfig)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createConfig(req, res){
    try {
        const { nombre, estado } = req.body

        if((nombre === "") || (estado === "")){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }
        
        const pool = await getConnection()

        await pool.request()
        .input("nombre", mssql.NVarChar, nombre)
        .input("estado", estado)
        .query(queriesConfig.queriesConfig)

        res.json(req.body)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptConfig(req, res){
    try {
        const { nombre, estado } = req.body
        const { id } = req.params

        if((nombre === "") || (estado === "")){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection()

        await pool.request()
        .input("id", mssql.Int, id)
        .input("nombre", mssql.NVarChar, nombre)
        .input("estado", estado)
        .query(queriesConfig.uptConfig)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}
import {getConnection, mssql, queriesRegInCarrito} from "../database/index.js";

export async function getRegInMedicamentos(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesRegInCarrito.getRegInMedicamentos)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getRegInMedicamento(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id', id)
        .query(queriesRegInCarrito.getRegInMedicamento)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getRegInMedicamentoJoin(req, res){
    try {
        const {id_medicamento} = req.params
        const pool = await getConnection();
        console.log(id_medicamento)
        const result = await pool.request()
        .input('id_medicamento', id_medicamento)
        .query(queriesRegInCarrito.getRegInMedicamentoJoin)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createRegInMedicamento(req, res){
    try {
        const { id_medicamento, id_ingresante, cantidad, tipoAccion} = req.body

        if((id_medicamento < 1) || (id_ingresante === "") || (cantidad < 0)){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }
        
        const pool = await getConnection()

        await pool.request()
        .input("id_medicamento", mssql.VarChar, (id_medicamento).toString())
        .input("id_ingresante", mssql.Int, id_ingresante)
        .input("cantidad", mssql.Int, cantidad)
        .input("tipoAccion", mssql.Bit, tipoAccion)
        .query(queriesRegInCarrito.addRegInMedicamento)

        res.json(req.body)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptRegInMedicamento(req, res){
    try {
        const { id_medicamento, cantidad, id_ingresante, candadoNuevo } = req.body
        const { id } = req.params

        console.log(req.body)

        if((id_medicamento < 1) || (id_ingresante < 1) || (cantidad < 1) || (!candadoNuevo)){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection()

        await pool.request()
        .input("id", mssql.Int, id)
        .input("id_medicamento", mssql.VarChar, id_medicamento)
        .input("id_ingresante", mssql.Int, id_ingresante)
        .input("cantidad", mssql.Int, cantidad)
        .input("candadoNuevo", mssql.Int, candadoNuevo)
        .query(queriesRegInCarrito.uptRegInMedicamento)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}
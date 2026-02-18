import {getConnection, mssql, queriesCarrito} from "../database/index.js";

export async function getMedicamentos(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesCarrito.getMedicamentos)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getMedicamento(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id', id)
        .query(queriesCarrito.getMedicamento)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createMedicamento(req, res){
    try {
        const { nombre, concentracion, forma, laboratorio, cantidad, cantidad_std, fecha_ven, reg_invima, lote, carrito, gaveta } = req.body

        if((nombre === "") || (cantidad_std < 0) || (cantidad < 0) || (carrito === "") || (gaveta === "")){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }
        
        const pool = await getConnection()

        const result = await pool.request()
        .input("nombre", mssql.NVarChar, nombre)
        .input("concentracion", mssql.NVarChar, concentracion)
        .input("forma", mssql.NVarChar, forma)
        .input("laboratorio", mssql.NVarChar, laboratorio)
        .input("cantidad", mssql.Int, cantidad)
        .input("cantidad_std", mssql.Int, cantidad_std)
        .input("fecha_ven", mssql.DateTime, fecha_ven)
        .input("reg_invima", mssql.NVarChar, reg_invima)
        .input("lote", mssql.NVarChar, lote)
        .input("carrito", mssql.NVarChar, carrito)
        .input("gaveta", mssql.NVarChar, gaveta)
        .query(queriesCarrito.addMedicamento)

        const insertedId = result.recordset[0].id;

        res.json({ id: insertedId});
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptRestMedicamento(req, res){
    try {        
        const { cantidad } = req.body
        const { id } = req.params

        if((cantidad < 0) ){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection()

        await pool.request()
        .input("id", mssql.Int, id)
        .input("cantidad", mssql.Int, cantidad)
        .query(queriesCarrito.uptRestMedicamento)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptMedicamento(req, res){
    try {        
        const { nombre, concentracion, forma, laboratorio, cantidad, cantidad_std, fecha_ven, reg_invima, lote, carrito, gaveta } = req.body
        const { id } = req.params

        if((nombre === "") || (cantidad < 0) || (cantidad_std < 0)){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection()

        await pool.request()
        .input("id", mssql.Int, id)
        .input("nombre", mssql.NVarChar, nombre)
        .input("concentracion", mssql.NVarChar, concentracion || null)
        .input("forma", mssql.NVarChar, forma)
        .input("laboratorio", mssql.NVarChar, laboratorio)
        .input("cantidad", mssql.Int, cantidad)
        .input("cantidad_std", mssql.Int, cantidad_std)
        .input("fecha_ven", mssql.DateTime, fecha_ven == '-02' ? null : fecha_ven)
        .input("reg_invima", mssql.NVarChar, reg_invima || null)
        .input("lote", mssql.NVarChar, lote || null)
        .input("carrito", mssql.NVarChar, carrito)
        .input("gaveta", mssql.NVarChar, gaveta)
        .query(queriesCarrito.uptMedicamento)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function delMedicamento(req, res){
    try {
        const {id} = req.params
        const estado = false
        const pool = await getConnection();

        const result = await pool.request()
        .input('id', id)
        .query(queriesCarrito.getMedicamento);

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'Medicamento no encontrado' });
        }

        await pool.request()
        .input('id', id)
        .input('estado', estado)
        .query(queriesCarrito.delMedicamento)

        res.sendStatus(204)
    } catch (error) {
        res.send(error.message)
    }
}
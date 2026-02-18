import { getConnection, mssql, queriesRegCarrito } from "../database/index.js";

export async function getRegMedicamentos(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesRegCarrito.getRegMedicamentos)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getRegMedicamentosGroup(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesRegCarrito.getRegMedicamentoGroup)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getRegMedicamento(req, res) {
    try {
        const { id } = req.params
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .query(queriesRegCarrito.getRegMedicamento)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getRegMedicamentoCarrito(req, res) {
    try {
        const { carrito } = req.params
        const pool = await getConnection();
        const result = await pool.request()
            .input('carrito', carrito)
            .query(queriesRegCarrito.getRegMedicamentoCarrito)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getRegMedicamentoIdSalida(req, res) {
    try {
        const { id_salida } = req.params
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_salida', id_salida)
            .query(queriesRegCarrito.getRegMdtoIdSalida)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createRegMedicamento(req, res) {
    try {
        const { medicamentos, candadoRoto, candadoNuevo, motivo, cedula, id_enfermeria } = req.body

        if ((medicamentos.length <= 0) || (candadoRoto == "") || (motivo == "") || (cedula == "") || (id_enfermeria == "")) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const today = new Date()

        const pool = await getConnection()

        const idSalidaResult = await pool.request()
            .query('USE Carrito; SELECT NEXT VALUE FOR Seq_id_salida AS nuevo_id');

        const id_salida = idSalidaResult.recordset[0].nuevo_id;

        for (const medicamento of medicamentos) {
            await pool.request()
                .input("id_medicamento", mssql.Int, medicamento.id)
                .input("cantidad", mssql.Int, medicamento.cantidad)
                .input("candadoRoto", mssql.NVarChar, candadoRoto)
                .input("candadoNuevo", mssql.NVarChar, candadoNuevo || null)
                .input("motivo", mssql.NVarChar, motivo)
                .input("cedula", mssql.NVarChar, cedula)
                .input("id_enfermeria", mssql.Int, id_enfermeria)
                .input("id_salida", mssql.NVarChar, id_salida)
                .input("fecha", mssql.DateTime, today)
                .query(queriesRegCarrito.addRegMedicamento);
        }

        res.json({
            id_salida: id_salida,
            cantidad_medicamentos: medicamentos.length,
            message: 'Lote de medicamentos registrado exitosamente'
        });
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptRegMedicamento(req, res) {
    try {
        const { id_medicamento, recibio, cantidad, carrito, gaveta, estado } = req.body
        const { id } = req.params

        if ((id_medicamento < 1) || (recibio === "") || (cantidad < 1) || (carrito === "") || (gaveta === "")) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection()

        await pool.request()
            .input("id", mssql.Int, id)
            .input("id_medicamento", mssql.Int, id_medicamento)
            .input("recibio", mssql.NVarChar, recibio)
            .input("cantidad", mssql.Int, cantidad)
            .input("carrito", mssql.NVarChar, carrito)
            .input("gaveta", mssql.NVarChar, gaveta)
            .input("estado", mssql.Bit, estado)
            .query(queriesRegCarrito.uptRegMedicamento)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptRegMdtoCandado(req, res) {
    try {
        const { candadoNuevo } = req.body
        const { id_salida } = req.params

        if (candadoNuevo == "" || id_salida == "") {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection()

        await pool.request()
            .input("id_salida", mssql.NVarChar, id_salida)
            .input("candadoNuevo", mssql.NVarChar, candadoNuevo)
            .query(queriesRegCarrito.uptRegMdtoCandado)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function delRegMedicamento(req, res) {
    try {
        const { id } = req.params
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', id)
            .query(queriesRegCarrito.getRegMedicamento);

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'Registro no encontrado' });
        }

        await pool.request()
            .input('id', id)
            .query(queriesRegCarrito.delRegMedicamento)

        res.sendStatus(204)
    } catch (error) {
        res.send(error.message)
    }
}
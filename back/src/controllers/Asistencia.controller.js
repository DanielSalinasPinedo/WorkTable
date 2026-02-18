import { getConnection2, mssql, queriesAsistencia } from "../database/index.js";

export async function createAsistencia(req, res) {
    try {
        const { caso, cedula, comentario } = req.body

        const pool = await getConnection2()

        await pool.request()
            .input("caso", mssql.NVarChar, caso)
            .input("cedula", mssql.NVarChar, cedula)
            .input("comentario", mssql.NVarChar, comentario)
            .query(queriesAsistencia.addAsistencia)

        res.json(req.body)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getAsistencias(req, res) {
    try {
        const pool = await getConnection2();
        const result = await pool.request().query(queriesAsistencia.getAsistencias)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getAsistencia(req, res) {
    try {
        const { id } = req.params
        const { caso } = req.query

        const pool = await getConnection2();
        const result = await pool.request()
            .input('cedula', id)
            .input('caso', caso)
            .query(queriesAsistencia.getAsistencia)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getAsistenciasCaso(req, res) {
    try {
        const { caso } = req.params

        const pool = await getConnection2();
        const result = await pool.request()
            .input('caso', caso)
            .query(queriesAsistencia.getAsistenciasCaso)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptAsistencia(req, res) {
    try {
        const { caso, cedula, comentario } = req.body
        const { id } = req.params

        if (!caso.trim() && !cedula.trim() && !comentario.trim()) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection2()

        // Verificar si el nuevo ID ya existe
        const checkResult = await pool.request()
            .input("id", mssql.Int, id)
            .query(queriesAsistencia.chkAsistencia);

        if (checkResult.recordset[0].count > 0) {
            await pool.request()
                .input("caso", mssql.NVarChar, caso)
                .input("cedula", mssql.NVarChar, cedula)
                .input("comentario", mssql.NVarChar, comentario)
                .query(queriesAsistencia.uptAsistencia)
        }
        else {
            return res.status(404).json({ msg: 'Mesa de trabajo no encontrada' })
        }

        res.json(req.body)

    } catch (error) {
        console.error(error)
    }
}

export async function delAsistencia(req, res) {
    try {
        const { id } = req.params
        const pool = await getConnection2();

        await pool.request()
            .input('id', id)
            .query(queriesAsistencia.delAsistencia)

        res.sendStatus(204)
    } catch (error) {
        res.send(error.message)
    }
}
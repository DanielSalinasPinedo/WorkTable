import {getConnection2, mssql, queriesWorkTable} from "../database/index.js";

export async function getWorkTables(req, res){
    try {
        const pool = await getConnection2();
        const result = await pool.request().query(queriesWorkTable.getWorkTables)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getWorkTable(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection2();
        const result = await pool.request()
        .input('id', id)
        .query(queriesWorkTable.getWorkTable)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createWorkTable(req, res){
    try {
        const { nombre, patientEnable, owner, asistencia, adjunto, adjuntoRes } = req.body

        const today = new Date()
        
        const pool = await getConnection2()

        await pool.request()
        .input("nombre", mssql.NVarChar, nombre)
        .input("fecha", mssql.DateTime, today)
        .input("owner", mssql.NVarChar, owner)
        .input("patientEnable", mssql.Bit, patientEnable)
        .input("asistencia", mssql.Bit, asistencia)
        .input("adjunto", mssql.Bit, adjunto)
        .input("adjuntoRes", mssql.Bit, adjuntoRes || false)
        .query(queriesWorkTable.addWorkTable)

        res.json(req.body)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptWorkTable(req, res){
    try {
        const { nombre, patientEnable, estado, asistencia, adjunto, adjuntoRes } = req.body
        const { id } = req.params

        if(!nombre.trim()){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection2()

        // Verificar si el nuevo ID ya existe
        const checkResult = await pool.request()
            .input("id", mssql.Int, id)
            .query(queriesWorkTable.chkWorkTable);

        if (checkResult.recordset[0].count > 0) {
            const mesa = await pool.request()
            .input('id', id)
            .query(queriesWorkTable.getWorkTable)

            if(mesa.recordset[0].patientEnable !== patientEnable || 
                mesa.recordset[0].asistencia != asistencia || 
                mesa.recordset[0].adjunto != adjunto ||
                mesa.recordset[0].adjuntoRes != adjuntoRes){
                const checkResult2 = await pool.request()
                .input('id', id)
                .query(queriesWorkTable.chkPatientCases);

                if (checkResult2.recordset[0].count > 0) {
                    return res.status(400).json({ msg: 'No se puede modificar la mesa de trabajo, ya hay casos asignados.' });
                }
            }

            await pool.request()
            .input("id", mssql.Int, id)
            .input("nombre", mssql.NVarChar, nombre)
            .input("patientEnable", mssql.Bit, patientEnable)
            .input("estado", mssql.Bit, estado)
            .input("asistencia", mssql.Bit, asistencia)
            .input("adjunto", mssql.Bit, adjunto)
            .input("adjuntoRes", mssql.Bit, adjuntoRes)
            .query(queriesWorkTable.uptWorkTable)
        }
        else{
            return res.status(404).json({msg: 'Mesa de trabajo no encontrada'})
        }

        res.json(req.body)

    } catch (error) {
        console.error(error)
    }
}

export async function delUser(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection2();

        const checkResult = await pool.request()
            .input('id', id)
            .query(queriesWorkTable.chkPatientCases);

        if (checkResult.recordset[0].count > 0) {
            return res.status(400).json({ msg: `No se puede eliminar la mesa de trabajo, hay ${checkResult.recordset[0].count} caso${checkResult.recordset[0].count > 1 ? "s" : ""} asignados a esa mesa.` });
        }

        const result = await pool.request()
        .input('id', id)
        .query(queriesWorkTable.delWorkTable)
        res.sendStatus(204)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}
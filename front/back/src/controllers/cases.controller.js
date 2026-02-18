import { getConnection2, mssql, queriesCases } from "../database/index.js";
const fs = require('node:fs')
const path = require('path');

function isValidDate(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

//Crear casos
export async function createCase(req, res) {
    const { admission, areaSalida, patient_name, patient_id, EPS, description, createdAt, user_create, resolvedAt, user_resolved, comentario, estado, fechaEstado, mesa, numFactura, responsable, valor } = req.body;
    const documento = req.file;
    const today = new Date()
    const valorNew = valor ?? 10;

    try {
        const pool = await getConnection2();

        const result = await pool.request()
            .input('admission', mssql.NVarChar, admission)
            .input('destinoPaciente', mssql.NVarChar, areaSalida !== 'undefined' ? areaSalida : null)
            .input('patient_name', mssql.NVarChar, patient_name)
            .input('patient_id', mssql.NVarChar, patient_id !== 'undefined' ? patient_id : null)
            .input('EPS', mssql.NVarChar, EPS)
            .input('description', mssql.NVarChar, description)
            .input('createdAt', mssql.DateTime, createdAt !== 'undefined' ? createdAt : today)
            .input('user_create', mssql.NVarChar, user_create)
            .input('resolvedAt', mssql.DateTime, resolvedAt !== 'undefined' ? resolvedAt : null)
            .input('user_resolved', mssql.NVarChar, user_resolved !== 'undefined' ? user_resolved : null)
            .input('comentario', mssql.Text, comentario !== 'undefined' ? comentario : null)
            .input('estado', null)
            .input('fechaEstado', mssql.DateTime, fechaEstado !== 'undefined' ? fechaEstado : null)
            .input('mesa', mssql.Int, mesa)
            .input('numFactura', mssql.NVarChar, numFactura !== 'undefined' ? numFactura : '')
            .input('responsable', mssql.NVarChar, responsable !== 'undefined' ? responsable : '')
            .input('valor', mssql.Float, parseFloat(valorNew))
            .input("documentoCreate", mssql.NVarChar, documento ? saveImage(documento) : null)
            .query(queriesCases.addCase);

        const newCase = {
            id: result.recordset[0].id,
            admission,
            patient_name,
            patient_id,
            EPS,
            description,
            createdAt: today,
            user_create,
            mesa,
            numFactura,
            responsable,
            valor
        };

        res.status(201).json(newCase);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
}

export async function downloadFile(req, res) {
    try {
        const { filename } = req.params
        const filePath = path.join(__dirname, `../../adjuntoMesa/${filename}`)
        res.download(filePath)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createPhoto(req, res) {
    try {
        res.send('Archivo guardado')
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

function saveImage(file) {
    if (file) {
        const newPath = `./adjuntoMesa/${Date.now() + file.originalname}`
        fs.renameSync(file.path, newPath)
        return newPath
    }
    else {
        return 'null'
    }
}

//Obtener todos los casos
export async function getCases(req, res) {
    try {
        const { mesa } = req.params
        const pool = await getConnection2();

        const result = await pool.request()
            .input('mesa', mesa)
            .query(queriesCases.getCases)

        // Devolver los resultados en formato JSON
        res.json(result.recordset);
    } catch (err) {
        console.error('Error ejecutando la consulta getCases:', err);
        res.status(500).send('Error en la consulta');
    }
}

export async function getCase(req, res) {
    try {
        const { id } = req.params
        const pool = await getConnection2();
        const result = await pool.request()
            .input('id', id)
            .query(queriesCases.getCase)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getCasesWorkTable(req, res) {
    try {
        const { mesa } = req.params
        const pool = await getConnection2();
        const result = await pool.request()
            .input('mesa', mesa)
            .query(queriesCases.getCasesMesa)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

//Obtener casos pendientes
export async function getCasesPen(req, res) {
    try {
        const { mesa } = req.params
        const pool = await getConnection2();

        const result = await pool.request()
            .input('mesa', mesa)
            .query(queriesCases.getCasesPend)

        // Devolver los resultados en formato JSON
        res.json(result.recordset);
    } catch (err) {
        console.error('Error ejecutando la consulta getCasesPen:', err);
        res.status(500).send('Error en la consulta');
    }
}

//Obtener casos resueltos
export async function getCasesPro(req, res) {
    try {
        const { mesa } = req.params
        const pool = await getConnection2();

        const result = await pool.request()
            .input('mesa', mesa)
            .query(queriesCases.getCasesPro)

        // Devolver los resultados en formato JSON
        res.json(result.recordset);
    } catch (err) {
        console.error('Error ejecutando la consulta getCasesPro:', err);
        res.status(500).send('Error en la consulta');
    }
}

//Obtener casos resueltos
export async function getCasesRes(req, res) {
    try {
        const { mesa } = req.params
        // Conectar a la base de datos
        const pool = await getConnection2();

        const result = await pool.request()
            .input('mesa', mesa)
            .query(queriesCases.getCaseRes)

        // Devolver los resultados en formato JSON
        res.json(result.recordset);
    } catch (err) {
        console.error('Error ejecutando la consulta getCasesRes:', err);
        res.status(500).send('Error en la consulta');
    }
}

export async function delCase(req, res) {
    try {
        const { id } = req.params
        const pool = await getConnection2();

        const result = await pool.request()
            .input('id', id)
            .query(queriesCases.getCase);

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'Caso no encontrado' });
        }

        await pool.request()
            .input('id', id)
            .query(queriesCases.delCase)

        res.sendStatus(204)
    } catch (error) {
        res.send(error.message)
    }
}

export async function PenCase(req, res) {
    const { id } = req.params;
    const { comentario, estado, user_pend, fechaEstado } = req.body;
    const documento = req.file;

    try {
        // Conectar a la base de datos
        const pool = await getConnection2();

        const result = await pool.request()
            .input("id", mssql.NVarChar, id)
            .input("user_pend", mssql.NVarChar, user_pend)
            .input("fechaEstado", mssql.DateTime, fechaEstado != 'null' ? fechaEstado : null)
            .input("comentario", mssql.NVarChar, comentario != 'null' ? comentario : null)
            .input("estado", estado)
            .input("documento", mssql.NVarChar, documento ? saveImage(documento) : null)
            .query(queriesCases.uptCasePen)

        // Verificar si se actualizó algún registro
        if (result.rowsAffected[0] > 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404); // Caso no encontrado
        }
    } catch (err) {
        console.error('Error ejecutando la consulta ResCase:', err);
        res.status(500).send('Error en la consulta');
    }
}

export async function ProCase(req, res) {
    const { id } = req.params;
    const { comentario, estado, user_process, processAt } = req.body;
    const documento = req.file;

    try {
        // Conectar a la base de datos
        const pool = await getConnection2();

        const result = await pool.request()
            .input("id", mssql.NVarChar, id)
            .input("user_process", mssql.NVarChar, user_process)
            .input("processAt", mssql.DateTime, processAt != 'null' ? processAt : null)
            .input("comentario", mssql.NVarChar, comentario != 'null' ? comentario : null)
            .input("estado", estado)
            .input("documentoPro", mssql.NVarChar, documento ? saveImage(documento) : null)
            .query(queriesCases.uptCasePro)

        // Verificar si se actualizó algún registro
        if (result.rowsAffected[0] > 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404); // Caso no encontrado
        }
    } catch (err) {
        console.error('Error ejecutando la consulta ProCase:', err);
        res.status(500).send('Error en la consulta');
    }
}

export async function getCaseFecha(req, res) {
    try {
        const { mesa, FechaIn, FechaOut } = req.body

        if (!mesa, !FechaIn, !FechaOut) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection2();
        const result = await pool.request()
            .input('mesa', mesa)
            .input('FechaIn', FechaIn)
            .input('FechaOut', FechaOut)
            .query(queriesCases.getCasesFecha)
        res.send(result.recordset)

    } catch (error) {
        console.error('Error ejecutando la consulta ProCase:', error);
        res.status(500).send('Error en la consulta', error);
    }
}

export async function getCasePenFecha(req, res) {
    try {
        const { mesa, FechaIn, FechaOut } = req.body

        if (!mesa, !FechaIn, !FechaOut) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection2();
        const result = await pool.request()
            .input('mesa', mesa)
            .input('FechaIn', FechaIn)
            .input('FechaOut', FechaOut)
            .query(queriesCases.getCasesPenFecha)
        res.send(result.recordset)

    } catch (error) {
        console.error('Error ejecutando la consulta ProCase:', error);
        res.status(500).send('Error en la consulta', error);
    }
}

export async function FinCase(req, res) {
    const { id } = req.params;
    const { comentario, estado, user_resolved, resolvedAt } = req.body;
    const documento = req.file;

    try {
        // Conectar a la base de datos
        const pool = await getConnection2();

        const result = await pool.request()
            .input("id", mssql.NVarChar, id)
            .input("user_resolved", mssql.NVarChar, user_resolved)
            .input("resolvedAt", mssql.DateTime, resolvedAt != 'null' ? resolvedAt : null)
            .input("comentario", mssql.NVarChar, comentario != 'null' ? comentario : null)
            .input("estado", estado)
            .input("documentoRes", mssql.NVarChar, documento ? saveImage(documento) : null)
            .query(queriesCases.uptCaseRes)

        // Verificar si se actualizó algún registro
        if (result.rowsAffected[0] > 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404); // Caso no encontrado
        }
    } catch (err) {
        console.error('Error ejecutando la consulta ResCase:', err);
        res.status(500).send('Error en la consulta');
    }
}

//Resolver caso
export async function ResCase(req, res) {
    const { id } = req.params;
    const { user_resolved, resolvedAt, comentario, estado, fechaEstado } = req.body;
    const documento = req.file;

    try {
        // Conectar a la base de datos
        const pool = await getConnection2();

        const result = await pool.request()
            .input("id", mssql.NVarChar, id)
            .input("user_resolved", mssql.NVarChar, user_resolved)
            .input("resolvedAt", mssql.DateTime, resolvedAt != 'null' ? resolvedAt : null)
            .input("comentario", mssql.NVarChar, comentario != 'null' ? comentario : null)
            .input("estado", estado)
            .input("fechaEstado", mssql.DateTime, fechaEstado)
            .input("documento", mssql.NVarChar, documento ? saveImage(documento) : null)
            .query(queriesCases.uptCase)

        // Verificar si se actualizó algún registro
        if (result.rowsAffected[0] > 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404); // Caso no encontrado
        }
    } catch (err) {
        console.error('Error ejecutando la consulta ResCase:', err);
        res.status(500).send('Error en la consulta');
    }
}
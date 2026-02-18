import { getConnection, mssql, queriesState } from "../database/index.js";
import cache from './cache.js'; // si usas node-cache
const fs = require('node:fs')
const path = require('path');

let lastKnownUpdate = null;

export async function createState(req, res) {
    try {
        const { id_modState, id_mensaje, time_modState, comentarios } = req.body
        const documento = req.file;

        if (!id_modState.trim() || !time_modState.trim()) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection()

        await pool.request()
            .input("id_modState", mssql.NVarChar, id_modState)
            .input("id_mensaje", mssql.Int, id_mensaje)
            .input("time_modState", mssql.DateTime, time_modState)
            .input("documento", mssql.NVarChar, saveImage(documento))
            .input("comentarios", mssql.NVarChar, comentarios)
            .query(queriesState.addState)

        res.json(req.body)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createPhoto(req, res) {
    try {
        res.send('imagen guardada')
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

function saveImage(file) {
    if (file) {
        const newPath = `./imgState/${Date.now() + file.originalname}`
        fs.renameSync(file.path, newPath)
        return newPath
    }
    else {
        return 'null'
    }
}

function deleteImage(filePath) {
    // Verifica si el archivo existe antes de intentar eliminarlo
    if (fs.existsSync(filePath) && filePath !== 'null') {
        fs.unlinkSync(filePath); // Elimina el archivo
    }
}

export async function getStates(req, res) {
    try {
        const cacheKey = 'State';

        const pool = await getConnection();

        // 1. Obtener fecha de última modificación de la BD
        const updatedResult = await pool.request()
            .query("SELECT updated FROM Config WHERE id = 8");

        const dbLastUpdate = updatedResult.recordset[0]?.updated;
        const lastModified = new Date(dbLastUpdate).toUTCString();

        // 2. Verificar si el navegador tiene la última versión
        const clientModifiedSince = req.headers['if-modified-since'];
        const clientDate = clientModifiedSince ? new Date(clientModifiedSince).getTime() : null;
        const dbDate = new Date(lastModified).getTime();

        if (clientDate && dbDate === clientDate) {
            //console.log('204State')
            return res.status(204).end(); // Navegador ya tiene los datos
        }

        // 3. Verificar si el backend tiene datos en cache válidos
        const cached = cache.get(cacheKey);
        if (cached && lastKnownUpdate?.getTime() === dbDate) {
            //console.log('cacheState')
            res.setHeader('Last-Modified', lastModified);
            return res.json(cached); // Responder desde cache del backend
        }

        const result = await pool.request().query(queriesState.getStates)

        cache.set(cacheKey, result.recordset);           // Actualizar cache
        lastKnownUpdate = new Date(lastModified);        // Guardar nueva marca de tiempo

        res.setHeader('Last-Modified', lastModified);    // Enviar cabecera al navegador
        //console.log('cachentState')

        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getStatesAll(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesState.getStatesAll)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getStateId(req, res) {
    try {
        const { startId, endId } = req.body

        if (!startId, !endId) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('startId', startId)
            .input('endId', endId)
            .query(queriesState.getStateId)
        res.send(result.recordset)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getStateFecha(req, res) {
    try {
        //const cacheKey = 'State';

        const { FechaIn, FechaOut } = req.body

        if (!FechaIn, !FechaOut) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection();

        // 1. Obtener fecha de última modificación de la BD
        /*const updatedResult = await pool.request()
            .query("SELECT updated FROM Config WHERE id = 8");*/

        //const dbLastUpdate = updatedResult.recordset[0]?.updated;
        //const lastModified = new Date(dbLastUpdate).toUTCString();

        // 2. Verificar si el navegador tiene la última versión
        /*const clientModifiedSince = req.headers['if-modified-since'];
        const clientDate = clientModifiedSince ? new Date(clientModifiedSince).getTime() : null;
        const dbDate = new Date(lastModified).getTime();

        if (clientDate && dbDate === clientDate) {
            console.log('204State')
            return res.status(204).end(); // Navegador ya tiene los datos
        }

        // 3. Verificar si el backend tiene datos en cache válidos
        const cached = cache.get(cacheKey);
        if (cached && lastKnownUpdate?.getTime() === dbDate) {
            console.log('cacheState')
            res.setHeader('Last-Modified', lastModified);
            return res.json(cached); // Responder desde cache del backend
        }*/

        const result = await pool.request()
            .input('FechaIn', FechaIn)
            .input('FechaOut', FechaOut)
            .query(queriesState.getStateFecha)

        /*cache.set(cacheKey, result.recordset);           // Actualizar cache
        lastKnownUpdate = new Date(lastModified);        // Guardar nueva marca de tiempo

        res.setHeader('Last-Modified', lastModified);    // Enviar cabecera al navegador
        console.log('cachentState')*/

        res.send(result.recordset)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}
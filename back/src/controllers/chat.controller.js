import { getConnection, mssql, queriesChat } from "../database/index.js";
import cache from './cache.js'; // si usas node-cache
const fs = require('node:fs')
const path = require('path');

let lastKnownUpdate = null;

export async function getChats(req, res) {
    try {
        const cacheKey = 'Chats';

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
            //console.log('204Chat')
            return res.status(204).end(); // Navegador ya tiene los datos
        }

        // 3. Verificar si el backend tiene datos en cache válidos
        const cached = cache.get(cacheKey);
        if (cached && lastKnownUpdate?.getTime() === dbDate) {
            //console.log('cacheChat')
            res.setHeader('Last-Modified', lastModified);
            return res.json(cached); // Responder desde cache del backend
        }

        // 4. Consultar la base de datos si no hay cache válido
        const result = await pool.request().query(queriesChat.getChats);

        cache.set(cacheKey, result.recordset);           // Actualizar cache
        lastKnownUpdate = new Date(lastModified);        // Guardar nueva marca de tiempo

        res.setHeader('Last-Modified', lastModified);    // Enviar cabecera al navegador
        //console.log('cachentChat')
        res.json(result.recordset);

    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function getChatsAll(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesChat.getChatsAll)
        if (!result.recordset.length === 0) {
            res.setHeader('Content-Type', 'image/jpeg');
        }
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getChat(req, res) {
    try {
        const { id } = req.params
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_mensaje', id)
            .query(queriesChat.getChat)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getChatnt(req, res) {
    try {
        // Supongamos que los IDs vienen en el cuerpo de la solicitud como un array
        const { ids } = req.body;

        // Si los IDs vienen como una cadena separada por comas en los parámetros de la consulta
        // const ids = req.query.ids.split(',');

        if (!ids) {
            return res.status(400).send("Se esperaba IDs");
        }

        const pool = await getConnection();

        // Construir la consulta SQL dinámica
        const query = `
            SELECT * FROM mensajes
            WHERE id_mensaje IN (${ids.map((_, index) => `@id${index}`).join(', ')})
        `;

        const request = pool.request();

        // Añadir cada ID como un parámetro de la consulta
        ids.forEach((id, index) => {
            request.input(`id${index}`, id);
        });

        const result = await request.query(query);

        res.send(result.recordset);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export async function getCountChat(req, res) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(queriesChat.getCountChat)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getChatUser(req, res) {
    try {
        const { id } = req.params

        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .query(queriesChat.getChatsUser)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getCountChatUser(req, res) {
    try {
        const { id } = req.params

        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .query(queriesChat.getCountChatUser)
        res.send(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getChatId(req, res) {
    try {
        const { startId, endId } = req.body

        if (!startId, !endId) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('startId', mssql.Int, startId)
            .input('endId', mssql.Int, endId)
            .query(queriesChat.getChatId)
        res.send(result.recordset)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getChatFecha(req, res) {
    try {
        const { FechaIn, FechaOut } = req.body

        if (!FechaIn, !FechaOut) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('FechaIn', FechaIn)
            .input('FechaOut', FechaOut)
            .query(queriesChat.getChatFecha)
        res.send(result.recordset)

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
        const newPath = `./img/${Date.now() + file.originalname}`
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

export async function createChat(req, res) {
    try {
        const { Text, State, time, id_usuario, id_modState, area } = req.body
        const documento = req.file;

        if (!time.trim(), !id_usuario.trim()) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection()

        const result = await pool.request()
            .input("Text", mssql.NVarChar, Text)
            .input("State", mssql.Int, State)
            .input("documento", mssql.NVarChar, saveImage(documento))
            .input("time", mssql.DateTime, time)
            .input("id_usuario", mssql.NVarChar, id_usuario)
            .input("id_modState", mssql.NVarChar, id_modState)
            .input("area", mssql.NVarChar, area)
            .query(queriesChat.addMsg)

        res.status(400)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptChatUser(req, res) {
    try {
        const { id_usuario, id_modState } = req.body;
        const { id } = req.params;

        console.log(id, id_usuario, id_modState)

        // 1. Validar que al menos un campo tenga valor
        if (!id && (!id_usuario.trim() || !id_modState.trim())) {
            return res.status(400).json({ msg: 'Por favor, llena al menos un campo (usuario o estado)' });
        }

        const pool = await getConnection();

        // 2. Construir la consulta y los parámetros dinámicamente
        let query = queriesChat.uptMsgUser; // Tu consulta base con comodines
        let params = [];

        if (id_usuario?.trim()) {
            params.push({ name: "id_usuario", type: mssql.NVarChar, value: id_usuario });
        }
        if (id_modState?.trim()) {
            params.push({ name: "id_modState", type: mssql.NVarChar, value: id_modState });
        }

        // Siempre incluir el ID del mensaje para la cláusula WHERE
        params.push({ name: "id_mensaje", type: mssql.NVarChar, value: id });

        // 3. Crear la cláusula SET dinámicamente
        let setClause = "";
        if (id_usuario?.trim()) {
            setClause += "id_usuario = @id_usuario";
        }
        if (id_modState?.trim()) {
            if (setClause) setClause += ", "; // Agregar coma si hay ambos campos
            setClause += "id_modState = @id_modState";
        }

        // 4. Cláusula WHERE (¡ESENCIAL!)
        const whereClause = "WHERE id_mensaje = @id_mensaje";

        // 5. Ensamblar la consulta final
        query = query.replace("/*SET_CLAUSE*/", setClause).replace("/*WHERE_CLAUSE*/", whereClause);

        // 6. Ejecutar la consulta
        const request = pool.request();
        params.forEach(param => request.input(param.name, param.type, param.value));
        await request.query(query);

        // 7. Enviar respuesta
        res.json({
            message: "Actualización exitosa",
            updatedFields: {
                id_usuario: id_usuario?.trim() || null,
                id_modState: id_modState?.trim() || null
            }
        });

    } catch (error) {
        console.error("Error al actualizar usuario:", error); // Log para depuración
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

export async function uptAS(req, res) {
    try {
        const { ASText } = req.body
        const { id } = req.params

        if (!ASText.trim(), !id.trim()) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection()

        await pool.request()
            .input("id_mensaje", mssql.NVarChar, id)
            .input("ASText", mssql.NVarChar, ASText)
            .query(queriesChat.uptASText)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptChat(req, res) {
    try {
        const { Text, State, time, id_modState, id_usuario, numMod } = req.body
        const { id } = req.params

        const { documento } = req.file === undefined ? "null" : req.file;

        if (!Text.trim(), !time.trim(), !id_usuario.trim()) {
            return res.status(404).json({ msg: 'Por favor llena todos los campos' })
        }

        const pool = await getConnection()

        const result = await pool.request()
            .input('id_mensaje', id)
            .query(queriesChat.getChat);

        let currentDocumento = result.recordset[0].documento;

        const newDocumento = documento ? documento : currentDocumento;

        await pool.request()
            .input("id_mensaje", mssql.NVarChar, id)
            .input("Text", mssql.NVarChar, Text)
            .input("State", mssql.Bit, State)
            .input("documento", mssql.NVarChar, newDocumento)
            .input("time", mssql.DateTime, time)
            .input("id_modState", mssql.NVarChar, !id_modState ? 'null' : id_modState)
            .input("id_usuario", mssql.NVarChar, id_usuario)
            .input("numMod", mssql.Int, numMod)
            .query(queriesChat.uptMsg)

        res.json(req.body)

    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function delChat(req, res) {
    try {
        const { id } = req.params
        const pool = await getConnection();

        const result = await pool.request()
            .input('id_mensaje', id)
            .query(queriesChat.getChat);

        if (result.recordset.length === 0) {
            return res.status(404).json({ msg: 'Chat no encontrado' });
        }

        const { documento } = result.recordset[0]; // Obtén el documento asociado

        const filePath = path.resolve(documento); // Obtiene la ruta completa del archivo

        deleteImage(filePath); // Llama a la función para eliminar la imagen

        await pool.request()
            .input('id_mensaje', id)
            .query(queriesChat.delMsg)

        res.sendStatus(204)
    } catch (error) {
        res.send(error.message)
    }
}
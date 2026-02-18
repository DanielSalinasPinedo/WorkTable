import {getConnection, mssql, queriesUser} from "../database/index.js";

export async function getUsers(req, res){
    try {
        const pool = await getConnection();
        const result = await pool.request().query(queriesUser.getUsers)
        res.json(result.recordset)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function getUser(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id_usuario', id)
        .query(queriesUser.getUser)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function createUser(req, res){
    try {
        const { id_usuario, nombre, role } = req.body

        if(!id_usuario.trim() || !nombre.trim() || !role.trim()){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }
        
        const pool = await getConnection()

        await pool.request()
        .input("id_usuario", mssql.NVarChar, id_usuario)
        .input("nombre", mssql.NVarChar, nombre)
        .input("role", mssql.NVarChar, role)
        .query(queriesUser.addUsers)

        res.json(req.body)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function uptUser(req, res){
    try {
        const { id_usuario, nombre, role, estado } = req.body
        const { id } = req.params

        if(!id_usuario.trim() || !nombre.trim() || !role.trim()){
            return res.status(404).json({msg: 'Por favor llena todos los campos'})
        }

        const pool = await getConnection()

        // Verificar si el nuevo ID ya existe
        const checkResult = await pool.request()
            .input("id_usuario", mssql.NVarChar, id)
            .query(queriesUser.chkUser);

        if (checkResult.recordset[0].count > 0) {
            await pool.request()
            .input("id_usuario", mssql.NVarChar, id_usuario)
            .input("nombre", mssql.NVarChar, nombre)
            .input("role", mssql.NVarChar, role)
            .input("id", mssql.NVarChar, id)
            .input('estado', estado)
            .query(queriesUser.uptUser)
        }
        else{
            return res.status(404).json({msg: 'Usuario no encontrado'})
        }

        res.json(req.body)

    } catch (error) {
        console.error(error)
    }
}

export async function delUser(req, res){
    try {
        const {id} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('id_usuario', id)
        .query(queriesUser.delUser)
        res.sendStatus(204)
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}

export async function login(req, res){
    try {
        const { id_usuario} = req.body; // Obtener el id_usuario desde el cuerpo de la solicitud
        
        // Verifica si el id_usuario está definido
        if (!id_usuario.trim()) {
            return res.status(400).json({ message: 'Por favor llena todos los campos.' });
        }

        // Obtener la conexión a la base de datos
        const pool = await getConnection();

        const checkResult = await pool.request()
            .input("id_usuario", mssql.NVarChar, id_usuario)
            .query(queriesUser.chkUser);

        if (checkResult.recordset[0].count > 0) {
            return res.status(200).json({
                message: 'El usuario ya existe',
                exists: true,   
                id_usuario: id_usuario
            })
        }
        else{
            return res.status(401).json({
                message: 'El usuario no existe',
                exists: false,
                id_usuario: checkResult.recordset[0].count
            })
        }
    } catch (error) {
        // Agregar logging detallado del error
        console.error('Error al intentar realizar el login:', error);

        // Manejar cualquier error del servidor
        return res.status(500).json({
            message: 'Error del servidor. Intente más tarde.',
            error: error.message // Puedes añadir más detalles aquí si lo deseas
        });
    }
};
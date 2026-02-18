import {getConnection, queriesSIOS} from "../database/index.js";

export async function getSIOSPte(req, res){
    try {
        const {cedula} = req.params
        const pool = await getConnection();
        const result = await pool.request()
        .input('cedula', cedula)
        .query(queriesSIOS.getNombrePteSIOS)
        res.send(result.recordset[0])
    } catch (error) {
        res.status(500)
        res.send(error.message)
    }
}
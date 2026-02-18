import mssql from 'mssql'
import config from '../config.js';

const dbSettings = {
    user: config.db1.dbUser,
    password: config.db1.dbPassword,
    server: config.db1.dbServer,
    database: config.db1.dbDatabase,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    requestTimeout: 300000, // Tiempo máximo para una consulta (5 minutos)
    pool: {
        idleTimeoutMillis: 300000, // Tiempo máximo para una consulta (5 minutos)
    }
}

const dbSettings2 = {
    user: config.db2.dbUser,
    password: config.db2.dbPassword,
    server: config.db2.dbServer,
    database2: config.db2.database,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    requestTimeout: 300000, // Tiempo máximo para una consulta (5 minutos)
    pool: {
        idleTimeoutMillis: 300000, // Tiempo máximo para una consulta (5 minutos)
    }
}

let pool1, pool2;

export async function getConnection() {
    try {
        if (!pool1) {
            pool1 = new mssql.ConnectionPool(dbSettings);
            await pool1.connect();
        } else if (!pool1.connected) {
            await pool1.connect(); // Reconecta si se cerró.
        }
        return pool1;
    } catch (err) {
        console.error('Error al conectar con la base de datos p1:', err);
        throw err;
    }
}

export async function getConnection2() {
    try {
        if (!pool2) {
            pool2 = new mssql.ConnectionPool(dbSettings2);
            await pool2.connect();
        } else if (!pool2.connected) {
            await pool2.connect(); // Reconecta si se cerró.
        }
        return pool2;
    } catch (err) {
        console.error('Error al conectar con la base de datos p2:', err);
        throw err; // Propaga el error para que el controlador sepa manejarlo.
    }
}

export { mssql };
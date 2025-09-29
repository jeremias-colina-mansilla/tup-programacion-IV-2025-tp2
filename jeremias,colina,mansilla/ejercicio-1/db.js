
import mysql from "mysql2/promise"

export let db;

export async function conectarDB() {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        })
        console.log("Conexion a db creada");
    } catch (error) {
        console.error("Error al conectar la db: ", error)
    }
}
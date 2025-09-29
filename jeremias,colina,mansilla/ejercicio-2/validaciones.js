// validaciones.js
import { body, param, query } from "express-validator";
import { db } from "./db.js";
import { validationResult } from "express-validator";

// Middleware general para manejar errores de validaciones
export async function verificarValidaciones(req, res, next) {
    const validaciones = validationResult(req);
    if (!validaciones.isEmpty()) {
        return res.status(400).json({ success: false, errors: validaciones.array() });
    }
    next();
}

// Validación de ID (params)
export const validarId = param("id").isInt({ min: 1 });

// Validaciones del body (para crear y actualizar)
export const validarBody = [
    body("nombre").isAlpha("es-ES", { ignore: " " }).isLength({ min: 5, max: 40 }),
    body("completada").isBoolean().toBoolean()
];

// Validaciones de filtros (query)
export const validarFiltros = [
    query("completadas").isBoolean().optional()
];

// Funciones auxiliares
export const formatearNombre = (nombre) => nombre.trim().toLowerCase();

export const verificarNombre = async (nombre, id) => {
    try {
        let sql = "SELECT * FROM tareas WHERE nombre = ?";
        const parametros = [nombre];

        if (id != undefined) {
            sql += " AND id_tareas != ?";
            parametros.push(id);
        }

        const [rows] = await db.execute(sql, parametros);

        return rows.length !== 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

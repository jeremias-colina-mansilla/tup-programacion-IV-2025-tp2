import express from "express";
import { db } from "./db.js";
import { 
    validarId, 
    validarBody, 
    validarFiltros, 
    verificarValidaciones, 
    formatearNombre, 
    verificarNombre 
} from "./validaciones.js";

const router = express.Router();

// GET: listar tareas (con filtro opcional)
router.get("/", [validarFiltros, verificarValidaciones], async (req, res) => {
    try {
        const parametros = [];
        const filtros = [];
        const { completadas } = req.query;

        let sql = "SELECT * FROM tareas";

        if (completadas !== undefined) {
            filtros.push("completada = ?");
            parametros.push(completadas === "true" || completadas === "1");
        }

        if (parametros.length > 0) {
            sql += " WHERE " + filtros.join(" AND ");
        }

        const [rows] = await db.execute(sql, parametros);
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Algo salió mal en el servidor" });
    }
});

// =========================
// GET: obtener tarea por ID
// =========================
router.get("/:id", [validarId, verificarValidaciones], async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [rows] = await db.execute("SELECT * FROM tareas WHERE id_tareas = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No existe una tarea con ese ID" });
        }

        res.json({ success: true, data: rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Algo salió mal en el servidor" });
    }
});

// =========================
// POST: crear nueva tarea
// =========================
router.post("/", [validarBody, verificarValidaciones], async (req, res) => {
    try {
        const { nombre, completada } = req.body;
        const nombreFormateado = formatearNombre(nombre);

        if (await verificarNombre(nombreFormateado)) {
            return res.status(400).json({ success: false, message: "Ya existe una tarea con ese nombre" });
        }

        const [result] = await db.execute(
            "INSERT INTO tareas (nombre, completada) VALUES (?, ?)", 
            [nombreFormateado, completada]
        );

        res.status(201).json({ 
            success: true, 
            data: { id_tareas: result.insertId, nombre: nombreFormateado, completada } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Algo salió mal en el servidor" });
    }
});

// =========================
// PUT: modificar tarea
// =========================
router.put("/:id", [validarId, validarBody, verificarValidaciones], async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nombre, completada } = req.body;
        const nombreFormateado = formatearNombre(nombre);

        const [rows] = await db.execute("SELECT * FROM tareas WHERE id_tareas = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No existe una tarea con ese ID" });
        }

        if (await verificarNombre(nombreFormateado, id)) {
            return res.status(400).json({ success: false, message: "Ya existe una tarea con ese nombre" });
        }

        await db.execute(
            "UPDATE tareas SET nombre = ?, completada = ? WHERE id_tareas = ?", 
            [nombreFormateado, completada, id]
        );

        res.json({ success: true, data: { id_tareas: id, nombre: nombreFormateado, completada } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Algo salió mal con el servidor" });
    }
});

// DELETE: eliminar tarea
router.delete("/:id", [validarId, verificarValidaciones], async (req, res) => {
    try {
        const id = Number(req.params.id);

        const [rows] = await db.execute("SELECT * FROM tareas WHERE id_tareas = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No existe una tarea con ese ID" });
        }

        await db.execute("DELETE FROM tareas WHERE id_tareas = ?", [id]);

        res.json({ success: true, data: rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Algo salió mal en el servidor" });
    }
});

export default router;

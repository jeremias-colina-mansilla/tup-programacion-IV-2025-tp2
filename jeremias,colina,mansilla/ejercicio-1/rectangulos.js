import express from "express"
import { db } from "./db.js"
import { param, body, validationResult } from "express-validator"

const router = express.Router();

// Validaciones 
const verificarValidaciones = (req, res, next) => {
    const validaciones = validationResult(req);
    if (!validaciones.isEmpty()) {
        return res.status(400).json({ success: false, errors: validaciones.array() });
    }

    next();
}

const validarId = [param("id").isInt({ min: 1 })];

const validarBody = [body("base").isFloat({ min: 0.01 }), body("altura").isFloat({ min: 0.01 })];

// Funciones utiles
const calculos = (base, altura) => ({ perimetro: 2 * (base + altura), superficie: base * altura });

// GET para obetener todos los rectangulos
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM rectangulos");

        res.json({ success: true, data: rows });

    } catch (error) {
        console.error(error);

        res.status(500).json({ success: false, message: "Algo salio mal en el servidor" });
    }
})

// GET para buscar rectangulo por su ID
router.get("/:id", [validarId, verificarValidaciones], async (req, res) => {
    try {
        const id = Number(req.params.id);

        const [rows] = await db.execute("SELECT * FROM rectangulos WHERE id_rectangulos = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No existe un rectangulo con ese ID" });
        }

        res.json({ success: true, data: rows[0] });

    } catch (error) {
        console.error(error);

        res.status(500).json({ success: false, message: "Algo salio mal en el servidoe" });
    }
});

// POST para cargar un nuevo rectangulo
router.post("/", [validarBody, verificarValidaciones], async (req, res) => {
    try {
        const { base, altura } = req.body;

        const { perimetro, superficie } = calculos(base, altura)

        const [result] = await db.execute("INSERT INTO rectangulos (base, altura, perimetro, superficie) VALUES (?, ?, ? ,?)", [base, altura, perimetro, superficie]);

        res.status(201).json({ success: true, data: { id_rectangulo: result.insertId, base, altura, perimetro, superficie } });

    } catch (error) {
        console.error(error);

        res.status(500).json({ success: false, message: "Algo salio mal en el servidor" });
    }
})

// PUT para modificar un nuevor rectangulo (usando su id)
router.put("/:id", [validarId, validarBody, verificarValidaciones], async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { base, altura } = req.body;

        const [rows] = await db.execute("SELECT * FROM rectangulos WHERE id_rectangulos = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No existe un rectangulo con ese ID" });
        }

        const { perimetro, superficie } = calculos(base, altura);

        await db.execute("UPDATE rectangulos SET base=?, altura=?, perimetro=?, superficie=? WHERE id_rectangulos =?", [base, altura, perimetro, superficie, id]);
        res.json({ success: true, data: { id_rectangulos: id, base, altura, perimetro, superficie } });

    } catch (error) {
        console.error(error);

        res.status(500).json({ success: false, message: "Algo salio con el servidor" })
    }
})

// DELETE para eliminar recatngulos por ID
router.delete("/:id", [validarId, verificarValidaciones], async (req, res) => {
    try {
        const id = Number(req.params.id);

        const [rows] = await db.execute("SELECT * FROM rectangulos WHERE id_rectangulos = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "No existe un rectangulo con ese ID" });
        }

        await db.execute("DELETE FROM rectangulos WHERE id_rectangulos = ?", [id]);

        res.json({ success: true, data: rows[0] });

    } catch (error) {
        console.error(error);

        res.status(500).json({ success: false, message: "Algo salio mal en el servidor" });
    }
});

export default router;
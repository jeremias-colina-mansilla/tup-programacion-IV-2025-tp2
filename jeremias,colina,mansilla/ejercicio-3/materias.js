import express from "express";
import { db } from "./db.js";
import { validarMateria, validarId } from "./validaciones.js";
import { validationResult } from "express-validator";

const router = express.Router();

// =========================
// LISTAR TODAS LAS MATERIAS
// =========================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM materias");
    res.json(rows);
  } catch (error) {
    console.error("Error al listar materias:", error);
    res.status(500).json({ msg: "Error al listar materias" });
  }
});

// =========================
// CREAR NUEVA MATERIA
// =========================
router.post("/", validarMateria, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors.array());

  const { nombre } = req.body;

  try {
    const [existe] = await db.execute("SELECT * FROM materias WHERE nombre = ?", [nombre]);
    if (existe.length > 0) return res.status(400).json({ msg: "La materia ya existe" });

    await db.execute("INSERT INTO materias (nombre) VALUES (?)", [nombre]);
    res.json({ msg: "Materia agregada correctamente" });
  } catch (error) {
    console.error("Error al crear materia:", error);
    res.status(500).json({ msg: "Error al crear materia" });
  }
});

// =========================
// MODIFICAR MATERIA
// =========================
router.put("/:id_materia", validarId.concat(validarMateria), async (req, res) => {
  const { id_materia } = req.params;
  const { nombre } = req.body;

  try {
    const [result] = await db.execute(
      "UPDATE materias SET nombre=? WHERE id_materia=?",
      [nombre, id_materia]
    );
    if (result.affectedRows === 0) return res.status(404).json({ msg: "Materia no encontrada" });

    res.json({ msg: "Materia modificada correctamente" });
  } catch (error) {
    console.error("Error al modificar materia:", error);
    res.status(500).json({ msg: "Error al modificar materia" });
  }
});

// =========================
// ELIMINAR MATERIA
// =========================
router.delete("/:id_materia", validarId, async (req, res) => {
  const { id_materia } = req.params;

  try {
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS cnt FROM alumnos WHERE id_materia = ?",
      [id_materia]
    );
    if (rows[0].cnt > 0) {
      return res.status(400).json({ msg: "Esta materia tiene alumnos" });
    }

    const [result] = await db.execute(
      "DELETE FROM materias WHERE id_materia = ?",
      [id_materia]
    );
    if (result.affectedRows === 0) return res.status(404).json({ msg: "Materia no encontrada" });

    res.json({ msg: "Materia eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar materia:", error);
    res.status(500).json({ msg: "Error al eliminar materia" });
  }
});

export default router;

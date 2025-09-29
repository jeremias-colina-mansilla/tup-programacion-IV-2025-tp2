import express from "express";
import { db } from "./db.js";
import { validarAlumno, validarId } from "./validaciones.js";
import { validationResult } from "express-validator";

const router = express.Router();

// =========================
// LISTAR ALUMNOS
// =========================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.id_alumno, a.nombre AS alumno, m.nombre AS materia, a.nota1, a.nota2, a.nota3
      FROM alumnos a
      JOIN materias m ON a.id_materia = m.id_materia
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al listar alumnos:", error);
    res.status(500).json({ msg: "Error al listar alumnos" });
  }
});

// =========================
// CREAR ALUMNO
// =========================
router.post("/", validarAlumno, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors.array());

  const { nombre, id_materia, nota1, nota2, nota3 } = req.body;

  try {
    const [materiaExiste] = await db.execute(
      "SELECT id_materia FROM materias WHERE id_materia = ?",
      [id_materia]
    );
    if (materiaExiste.length === 0)
      return res.status(400).json({ msg: "La materia indicada no existe" });

    const [existe] = await db.execute(
      "SELECT * FROM alumnos WHERE nombre = ? AND id_materia = ?",
      [nombre, id_materia]
    );
    if (existe.length > 0)
      return res.status(400).json({ msg: "Ya existe ese alumno en esa materia" });

    await db.execute(
      "INSERT INTO alumnos (nombre, id_materia, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
      [
        nombre ?? null,
        id_materia ?? null,
        nota1 ?? null,
        nota2 ?? null,
        nota3 ?? null
      ]
    );

    res.json({ msg: "Alumno agregado correctamente" });
  } catch (error) {
    console.error("Error al crear alumno:", error);
    res.status(500).json({ msg: "Error al crear alumno" });
  }
});

// =========================
// MODIFICAR ALUMNO
// =========================
router.put("/:id_alumno", validarId.concat(validarAlumno), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors.array());

  const { id_alumno } = req.params;
  const { nombre, id_materia, nota1, nota2, nota3 } = req.body;

  try {
    const [existe] = await db.execute(
      "SELECT * FROM alumnos WHERE id_alumno = ?",
      [id_alumno]
    );
    if (existe.length === 0) return res.status(404).json({ msg: "Alumno no encontrado" });

    const [materiaExiste] = await db.execute(
      "SELECT id_materia FROM materias WHERE id_materia = ?",
      [id_materia]
    );
    if (materiaExiste.length === 0)
      return res.status(400).json({ msg: "La materia indicada no existe" });

    const [duplicado] = await db.execute(
      "SELECT * FROM alumnos WHERE nombre = ? AND id_materia = ? AND id_alumno <> ?",
      [nombre, id_materia, id_alumno]
    );
    if (duplicado.length > 0)
      return res.status(400).json({ msg: "Ya existe otro alumno con esa materia" });

    const [result] = await db.execute(
      "UPDATE alumnos SET nombre=?, id_materia=?, nota1=?, nota2=?, nota3=? WHERE id_alumno=?",
      [
        nombre ?? null,
        id_materia ?? null,
        nota1 ?? null,
        nota2 ?? null,
        nota3 ?? null,
        id_alumno
      ]
    );

    if (result.affectedRows === 0)
      return res.status(500).json({ msg: "No se pudo modificar el alumno" });

    res.json({ msg: "Alumno modificado correctamente" });
  } catch (error) {
    console.error("Error al modificar alumno:", error);
    if (error && error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ msg: "La materia indicada no existe (clave foránea)" });
    }
    res.status(500).json({ msg: "Error al modificar alumno" });
  }
});

// =========================
// ELIMINAR ALUMNO
// =========================
router.delete("/:id_alumno", validarId, async (req, res) => {
  const { id_alumno } = req.params;
  try {
    const [result] = await db.execute(
      "DELETE FROM alumnos WHERE id_alumno = ?",
      [id_alumno]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ msg: "Alumno no encontrado" });

    res.json({ msg: "Alumno eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar alumno:", error);
    res.status(500).json({ msg: "Error al eliminar alumno" });
  }
});

export default router;

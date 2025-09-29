import { body, param } from "express-validator";

export const validarAlumno = [
  body("nombre")
    .isString()
    .withMessage("El nombre debe ser un texto")
    .notEmpty()
    .withMessage("El nombre no puede estar vacío"),
  body("materia_id")
    .isInt({ gt: 0 })
    .withMessage("El id de la materia debe ser un número válido"),

  body("nota1")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 1 debe estar entre 0 y 10"),
  body("nota2")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 2 debe estar entre 0 y 10"),
  body("nota3")
    .isFloat({ min: 0, max: 10 })
    .withMessage("La nota 3 debe estar entre 0 y 10"),
];

export const validarId = [
  param("id").isInt({ gt: 0 }).withMessage("El id debe ser un número válido"),
];

export const validarMateria = [
  body("nombre")
    .isString()
    .withMessage("El nombre de la materia debe ser un texto")
    .notEmpty()
    .withMessage("El nombre de la materia no puede estar vacío"),
];
import { body, param, validationResult } from "express-validator";

// Validar ID (param en la URL)
export const validarId = [
  param("id_rectangulo")
    .isInt({ min: 1 })
    .withMessage("El ID debe ser un número entero positivo"),
];

// Validar base y altura (en el body)
export const validarBaseAltura = [
  body("base")
    .isFloat({ min: 1 })
    .withMessage("La base debe ser un número mayor a 0"),
  body("altura")
    .isFloat({ min: 1 })
    .withMessage("La altura debe ser un número mayor a 0"),
];

// Middleware para verificar validaciones
export const verificarValidaciones = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "❌ Falla de validación",
      errores: errors.array(),
    });
  }
  next();
};

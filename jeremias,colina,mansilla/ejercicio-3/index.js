import express from "express";
import { conectarDB } from "./db.js";
import alumnos from "./alumnos.js";
import materias from "./materias.js";

const app = express();
const port = 3000

app.use(express.json());

conectarDB()

app.use("/alumnos", alumnos);

app.use("/materias", materias);

app.listen(port, () => console.log(`Servidor iniciado en puerto ${port}`));
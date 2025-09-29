import express from "express"
import { conectarDB } from "./db.js"
import tareasRouter from "./tareas.js"

const app = express();
const port = 3000;

app.use(express.json());

conectarDB();

app.use("/tareas", tareasRouter)

app.listen(port, () => {
    console.log(`La app esta funcionando en el puerto ${port}`);
})
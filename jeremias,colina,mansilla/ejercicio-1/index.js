import express from "express"
import { conectarDB } from "./db.js"
import routerRectangulos from "./rectangulos.js"

const app = express();
const port = 3000;

app.use(express.json());

conectarDB();

app.use("/rectangulos", routerRectangulos)

app.listen(port, () => {
    console.log(`La app esta funcionando en el puerto ${port}`);
})
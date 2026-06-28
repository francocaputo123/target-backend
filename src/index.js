import express from "express"
import cors from "cors"
import { corsOptions } from "./config/cors.js"
import router from "./routes/api.js"
import { colorize } from "./utils/colors.js"
import { limit } from "./config/limiter.js"
import path from "path";
import { fileURLToPath } from "url";

const __filename =  fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//puertos
const PORT = process.env.PORT || 3000

//inicialización de express
const app = express()

//MIDDLEWARES
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(limit)
app.use("/public/uploads", express.static(path.join(__dirname, "../public/uploads")))
//ruta principal
app.use("/api", router)

app.listen(PORT, () => {
    console.log(`${colorize("[SERVIDOR]", "green")} Servidor levantado en el puerto: http://localhost:${PORT}`)
})


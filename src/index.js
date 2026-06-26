import express from "express"
import cors from "cors"
import { corsOptions } from "./config/cors.js"
import router from "./routes/api.js"
import { colorize } from "./utils/colors.js"

//puertos
const PORT = process.env.PORT || 3000

//inicializacion de express
const app = express()

app.listen(PORT, () => {
    console.log(`${colorize("[SERVIDOR]", "green")} Servidor levantado en el puerto: http://localhost:${PORT}`)
})

//MIDDLEWARES
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//ruta principal
app.use("/api", router)



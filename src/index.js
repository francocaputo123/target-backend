import express from "express"
import cors from "cors"
import { corsOptions } from "./config/cors.js"
import router from "./routes/api.js"

//puertos
const PORT = process.env.PORT || 3000

//inicializacion de express
const app = express()

app.listen(PORT, () => {
    console.log(`Server running on port: http://localhost/${PORT}`)
})

//MIDDLEWARES
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//ruta principal
app.use("/api", router)



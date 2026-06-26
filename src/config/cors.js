/*

Archivo para los origines permitidos por cors, esto se exporta a index para configurar las opciones
de Cors

*/

const corsOptions = {
    origin: (origin, callback) => {
        const origins = process.env.ORIGIN ? process.env.ORIGIN.split(",") : [];

        const allowedOrigins = [
            "http://localhost:5500",
            ...origins
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("No permitido por CORS."))
        }
    },
    methods: ["GET", "PUT", "POST", "DELETE"],
    credentials: true

}

export { corsOptions }
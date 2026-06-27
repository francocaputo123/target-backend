import { colorize } from "../utils/colors.js"
import { uuid } from "zod"
import { robotHandler } from "../services/robotHandler.js"
import { EventEmitter } from "events"
import { emiter } from "../services/robotHandler.js"

//ruta principal de escaneo
export const scan = async (req,res) => {

    try {
        const { url } = req.body

        console.log(`${colorize("[RECIBIDA]", "green")} URL recibida: ${url}`)

        //generamos un id de tarea para que el front lo pase a listenscan y rastree por id
        const uuid = crypto.randomUUID();
        const jobId = `job_${uuid}`;

        /*esta funcion empezara un evento el cual se llama robotUpdate. Se va a subscribir a ese evento
        y el robot enviara la informacion. Esto para que el front no nos de un error de timeout.
        */ 
        robotHandler(url, jobId)

        return res.status(200).json({
            "success" : true,
            "message" : "Escaneo iniciado",
            "jobId" : jobId
        })

    } catch (error) {
        console.log(`${colorize("[ERROR]", "red")} Hubo un error en el servidor`)
        return res.status(500).json({
            "status" : false,
            "message" : "Hubo un error en el servidor: " + error
        })
    }
}

export const getData = (req,res) => {
    try {
        const { jobId } = req.params

        /*Headers obligatorios para mantener la conexion abierta
        */
        res.writeHead(200, {
        'Content-Type': 'text/event-stream', //le indica al servidor que se abre una conexion SSE
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive' //mantiene la conexion abierta, en caso de desconexion, intenta conectarse automaticamente.
        })

        //creamos una funcion. Esta nos servira para subscribirla al evento y que maneje los datos que trae del robot.
        const handler = (evt) => {
            if (evt.jobId !== jobId) return

            //se envian los datos al cliente
            res.write(`data: ${JSON.stringify(evt)}\n\n`)

            console.log(`${colorize("[SERVIDOR]", "green")} Datos del robot recibidos`)

            if(evt.status === "Completado" || evt.status === "Error") {
                emiter.off('robotUpdate', handler)
                res.end()
            }
        }
        //se subscribe al evento del robot
        emiter.on('robotUpdate', handler)
        //cerramos la conexion en caso de que el front cierre el canal
        req.on('close', () => {
            emiter.off('robotUpdate', handler)
            res.end()
        })
    } catch (error) {
        console.log(`${colorize("[ERROR]", "red")} Hubo un error en el servidor`)
        return res.status(500).json({
            "status" : "Error",
            "message" : "Error en el servidor",
            "error" : error
        })
    }
}
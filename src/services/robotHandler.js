import { EventEmitter } from "events"
import { colorize } from "../utils/colors.js"
import { aiHandler } from "./aiHandler.js"
import { ejecutarRobot } from "./robot/index-robot.js"

export const emiter = new EventEmitter()

/*
Esta funcion es un envoltorio del roobot, se encarga de ir enviando mediante el evento
"robotUpdate" la informacion que vaya trayendo de la pagina.

Estados.
Estado del scrapping: DATA_RESPONSE
Estado de la ia: AI_RESPONSE
Estado final: COMPLETE (se cierra la conexion)
*/

export const robotHandler = async (url, jobId, aiResponse) => {
    try {
        console.log(`${colorize("[ROBOT]", "yellow")} Id y url recibidas`)
        //Una vez se recibe el id, se inicia un evento el cual avisa de que el robot empezo su trabajo.
        emiter.emit('robotUpdate', {
            jobId,
            "status" : "Started",
            "message" : "Robot iniciado"
        })

        const data = await ejecutarRobot(url)

        //una vez finalizado, se emite el evento con los datos.
        emiter.emit('robotUpdate', {
            jobId,
            "status" : "DATA_RESPONSE",
            "message" : "Completado",
            data : data
        })

        //si el cliente requiere ia, se emite primero el evento de scrapping y despues el evento de ia
        if(aiResponse == true) {
            const response = await aiHandler(data)

            emiter.emit('robotUpdate', {
                jobId,
                "status" : "AI_RESPONSE",
                "messgae" : "Completado",
                aiResponse : response
            })
        }

        emiter.emit('robotUpdate', {
            jobId,
            "status" : "COMPLETE",
            "message" : "Transferencia de datos completada"
        })

        console.log(`${colorize("[ROBOT]", "green")} Datos enviados`)
    } catch (error) {
        emiter.emit('robotUpdate', {
            jobId,
            "status" : "ERROR",
            "message" : "Error trayendo los datos",
            "error" : error
        })
    }
}

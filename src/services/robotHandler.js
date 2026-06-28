import { EventEmitter } from "events"
import { colorize } from "../utils/colors.js"
import { ejecutarRobot } from "./robot/index-robot.js"

export const emiter = new EventEmitter()

/*
Esta funcion es un envoltorio del roobot, se encarga de ir enviando mediante el evento
"robotUpdate" la informacion que vaya trayendo de la pagina.
*/

export const robotHandler = async (url, jobId) => {
    try {
        console.log(`${colorize("[ROBOT]", "yellow")} Id y url recibidas`)
        //Una vez se recibe el id, se inicia un evento el cual avisa de que el robot empezo su trabajo.
        emiter.emit('robotUpdate', {
            jobId,
            "status" : "Iniciado",
            "message" : "Robot iniciado"
        })

        const data = await ejecutarRobot(url)

        //una vez finalizado, se emite el evento con los datos.
        emiter.emit('robotUpdate', {
            jobId,
            "status" : "Completado",
            "message" : "Completado",
            data : data
        })
        console.log(`${colorize("[ROBOT]", "green")} Datos enviados`)
    } catch (error) {
        emiter.emit('robotUpdate', {
            jobId,
            "status" : "Error",
            "message" : "Error trayendo los datos",
            "error" : error
        })
    }
}

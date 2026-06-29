import ollama from 'ollama'
import { colorize } from "../utils/colors.js"

/*
Servicio de IA. Este archivo se conecta a ollama (en local) para generar una respuesta
sobre el scrapping que hizo el robot
*/

export const aiHandler = async (data) => {
    try {
        console.log(`${colorize("[AI SERVICE]", "yellow")} Procesando datos con Ollama`)

        const filteredData = {
            url: data?.url || "Desconocida",
            servidor: data?.infraestructura?.servidor || {},
            cabecerasHttp: data?.infraestructura?.seguridad?.cabecerasHttp || {}
        };

        /*
        Prompt es la variable que se pasa a generate que contiene las instrucciones de generacion de respuesta.
        Como solo se requiere un analisis, se utiliza generate en vez de .chat (es mas para pregunta respuesta, este no seria el caso).
        */
        const prompt = `Hazme una análisis detallado de las cabeceras http en base a el scrapping de este JSON. No mas de 100 palabras:
        Sitio: ${filteredData.url}
        Servidor: ${JSON.stringify(filteredData.servidor)}
        Datos de Cabeceras:
        ${JSON.stringify(filteredData.cabecerasHttp, null, 2)}
        `
        const response = await ollama.generate({
            model : 'llama3', //IMPORTANTE: El modelo es con llama3, si es otro modelo, no va a funcionar.
            prompt : prompt,
            stream: false
        })

        console.log(`${colorize("[AI SERVICE]", "green")} Análisis generado exitosamente.`)
        return response.response;

    } catch (error) {
        console.log(`${colorize("[AI SERVICE]", "red")} Fallo al generar respuesta.`)
        return "No se pudo generar el análisis automático."
    }
}
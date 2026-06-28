import ollama from 'ollama'
import { colorize } from "../utils/colors.js"

export const aiHandler = async (data) => {
    try {
        console.log(`${colorize("[AI SERVICE]", "yellow")} Procesando datos con Ollama`)

        const filteredData = {
            url: data?.url || "Desconocida",
            servidor: data?.infraestructura?.servidor || {},
            cabecerasHttp: data?.infraestructura?.seguridad?.cabecerasHttp || {}
        };

        const prompt = `Hazme una análisis detallado de las cabeceras http en base a el scrapping de este JSON. No mas de 200 palabras:
        Sitio: ${filteredData.url}
        Servidor: ${JSON.stringify(filteredData.servidor)}
        Datos de Cabeceras:
        ${JSON.stringify(filteredData.cabecerasHttp, null, 2)}
        `
        const response = await ollama.generate({
            model : 'llama3',
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
/*
Este middleware contiene validaciones de protocolos http provenientes de la url
ademas de proteger contra urls privadas
*/

import { URL } from "url"
import { colorize } from "../utils/colors.js"

export const protectedUrl  = (req,res,next) => {
    try {
        const { url } = req.body
        const parsedUrl = new URL(url)

        //Solo protocolos HTTP/S
        if(parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return res.status(400).json({
                "success" : false,
                "message" : "Solo se permiten protocolos http y https."
            })
        }

        const host = parsedUrl.hostname.toLowerCase()

        //ips no permitidas: locales y loops (::1)
        const notAllowed = [
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            "::1"
        ]

        if(notAllowed.includes(host)) {
            console.log(`${colorize("[ERROR]", "red")} La URL no es válida`)
            return res.status(400).json({
                "success" : false,
                "message" : "Acceso denegado: URL inválida."
            })
        }

        console.log(`${colorize("[SERVIDOR]", "yellow")} Segundo middleware validado correctamente`)
        next()
    } catch (errors) {
        console.log(`${colorize("[ERROR]", "red")} Error en el segundo middleware`)
        return res.status(400).json({
            "status" : false,
            "message" : "Error al procesar la URL",
            errors : errors.errors
        })
    }
}
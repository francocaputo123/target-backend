/*

Este middleware servira para la validacion de la url. Se encara de sanitizar la url y
verificar que sea correcta.

*/

import {z} from "zod"
import { colorize } from "../utils/colors.js"

export const urlValidator = (req, res, next) => {
    //definimos el esquema con zod
    const urlSchema = z.object({
        url : z.string()
        .trim()
        .min(1, "La url es requerida.")
        .max(2048, "La url es demasiado larga")
        .url("El formato URL no es válido.")
    })

    try {
        //validamos el esquema y lo volvemos a pasar al body
        const { url } = req.body
        //se verifica primero si no la url NO es un valor no permitido
        const notAllowed = [null, "", undefined]

        if(Object.values(notAllowed).includes(url)) {
            return res.status(400).json({
                "success" : false,
                "message" : "La URL es requerida."
            })
        }
        //se le pasa al siguiente middleware
        console.log(`${colorize("[SERVIDOR]", "yellow")} Primer middleware validado correctamente`)
        req.body = urlSchema.parse(req.body)
        next()
    } catch (errors) {
        return res.status(400).json({
            "success" : false,
            "message" : "Datos inválidos",
            errors : errors.errors
        })
    }
}

/*

Este middleware servira para la validacion de la url. Se encara de sanitizar la url y 
verificar que sea correcta.

*/

import {z} from "zod"

export const urlValidator = (req, res, next) => {
    //definimos el esquema con zod
    const urlSchema = z.object({
        url : z.string()
        .trim()
        .min(1, "La url es requerida.")
        .url("El formato URL no es válido.")
    })

    try {
        //validamos el esquema y lo volvemos a pasar al body
        const { url } = req.body
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

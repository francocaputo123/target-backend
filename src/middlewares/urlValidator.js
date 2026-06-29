/*

Este middleware sirve para la validación de la url. Se encarga de sanitizar la url y
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
        .url("El formato URL no es válido."),
        aiResponse: z.boolean().optional()
    })

    try {
        //validamos el esquema y lo volvemos a pasar al body
        const { url } = req.body
        //se verifica primero si la url NO es un valor no permitido
        const notAllowed = [null, "", undefined]

        if(Object.values(notAllowed).includes(url)) {
            console.log(`${colorize("[ERROR]", "red")} No hay URL`)
            return res.status(400).json({
                "success" : false,
                "message" : "La URL es requerida."
            })
        }
        //se le pasa al siguiente middleware
        req.body = urlSchema.parse(req.body)
        console.log(`${colorize("[SERVIDOR]", "yellow")} Primer middleware validado correctamente`)
        next()

    } catch (errors) {
        console.log(`${colorize("[ERROR]", "red")} Error en el primer middleware`)

        //solo para que devuelva mas legible
        if (errors instanceof z.ZodError) {
        const fieldErrors = z.flattenError(errors).fieldErrors

        return res.status(400).json({
            "success": false,
            "message": "Datos inválidos",
            "errors": fieldErrors
        });
        }

        return res.status(400).json({
            "success" : false,
            "message" : "Datos inválidos",
            "errors" : errors
        })
    }
}

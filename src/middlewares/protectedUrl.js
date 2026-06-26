/*
Este middleware contiene validaciones de protocolos http provenientes de la url
ademas de proteger contra urls privadas 
*/

import URL from "url"


export const protectedUrl  = (req,res,next) => {
    try {
        const { url } = req.body
        const parsedUrl = new URL(url)

        //SOLO PROTOCOLOS HTTP/S
        if(parsedUrl.protocol !== "http:" || parsedUrl.protocol !== "https:") {
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
            return res.status(400).json({
                "success" : false,
                "message" : "Acceso denegado: URL."
            })
        }

    } catch (error) {
        
    }
}
import { rateLimit } from "express-rate-limit"

/*
Limitador de peticiones, si recibimos demasiadas peticiones del front
el limitador preveendra saturar el backend y el robot con demasiadas peticiones
*/

export const limit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
	limit: 10, //10 peticiones por ip
    message : {
        "success" : false,
        "message" : "Has realizado demasiadas peticiones. Espera 1 minuto antes de poder seguir."
    },
    statusCode : 429,
	standardHeaders: true, 
	legacyHeaders: false, 
})
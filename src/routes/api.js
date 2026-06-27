/*
En este archivo irán todas las rutas que contendrá el backend.
*/

//controller
import * as AnalyzerController from "../controller/analyzer.controller.js"

//importación de middlewares
import { urlValidator } from "../middlewares/urlValidator.js";
import { protectedUrl } from "../middlewares/protectedUrl.js";

//express
import { Router } from "express";

//MIDDLEWARES
const router = Router()
const validator = urlValidator
const protectedValidator = protectedUrl

//rutas principales de escaneo
router.post("/scan", validator, protectedValidator, AnalyzerController.scan)
router.get("/get-data/:jobId", AnalyzerController.getData)

//ruta solo de prueba
router.get("/sanity-check", (req,res) => {
    res.status(200).json({
        "status" : "success",
        "message" : "Server is running"
    })
})

//Es solo un manejador en caso de que la ruta no exista
router.use((req,res) => {
    res.status(404).json({
        "status" : false,
        "message" : "La ruta a la que intentaste acceder no existe."
    })
})


export default router
/*
En este archivo iran todas las rutas que contendra el backend.
*/

//controller
import * as AnalyzerController from "../controller/analyzer.controller.js"

import { Router } from "express";

//MIDDLEWARES
const router = Router()

router.post("/scan", AnalyzerController.scan)

//ruta solo de verificacion
router.get("/sanity-check", (req,res) => {
    res.status(200).json({
        "status" : "success",
        "message" : "Server is running"
    })
})

export default router
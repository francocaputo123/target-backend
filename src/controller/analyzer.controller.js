import { colorize } from "../utils/colors.js"

//ruta principal de escaneo
export const scan = async (req,res) => {

    try {
        const { url } = req.body

        console.log(`${colorize("[RECIBIDA]", "green")} URL recibida: ${url}`)

        //acá se traerán los datos del robot
        const response = null

        return res.status(200).json({
            "messgae" : "Its working " + url
        })

    } catch (error) {
        console.log(`${colorize("[ERROR]", "red")} Hubo un error en el servidor`)
        return res.status(500).json({
            "status" : false,
            "message" : "Huebo un error en el servidor: " + error
        })
    }
}
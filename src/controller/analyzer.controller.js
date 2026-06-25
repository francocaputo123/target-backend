//ruta principal de escaneo
export const scan = async (req,res) => {

    const { url } = req.body

    return res.status(200).json({
        "messgae" : "Its working " + url
    })
}
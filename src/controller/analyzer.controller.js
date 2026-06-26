//ruta principal de escaneo
export const scan = async (req,res) => {

    const { url } = req.body
    console.log(`URL recibida: ${url}`)

    return res.status(200).json({
        "messgae" : "Its working " + url
    })
}
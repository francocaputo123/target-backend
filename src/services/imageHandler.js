import fs from 'fs/promises';
import path from 'path';
import { colorize } from '../utils/colors.js';

/**
Este servicio podra ser integrado por el robot, su funcion es guardar en el backend las imagenes que traiga el robot.
@param url Es la url de la imagen que dispondra el robot
@param jobId Es el id generado por el servidor en la ruta scan
@param imgName Nombre de la imagen que tendra la imagen junto al id unico.
*/

export const imageHandler = async (url, jobId, imgName) => {
    try {
        //se hace un fetch para descargar la imagen
        const response = await fetch(url);

        if(!response) throw new Error("La url no devolvio nada")

        //temporalmente se convierte en un archivo binario asi podemos manejarlo correctamente
        const buffer = Buffer.from(await response.arrayBuffer());

        //creamos el nuevo nombre que tendra la imagen
        const newName = `${jobId}_${imgName.toLowerCase().replace(/ /g, "_")}.jpg`;

        const pathUpload = path.join(process.cwd(), 'src', 'public', 'uploads', newName);
        console.log(pathUpload)

        //finalmente se escribe el archivo en la carpeta que se le indico
        await fs.writeFile(pathUpload, buffer);

        //se retorta al robot para que use
        const baseUrl = process.env.BACKEND_URL || "http://localhost:3000";
        return `${baseUrl}/public/uploads/${newName}`;
    } catch (error) {
        console.log(`${colorize("[ERROR]"), "red"} Fallo en el handler: ${error}`)
        return null;
    }
};
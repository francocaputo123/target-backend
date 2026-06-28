import fs from 'fs/promises';
import path from 'path';
import { colorize } from '../utils/colors.js';

/**
Este servicio podra ser integrado por el robot, su funcion es guardar en el backend las imagenes que traiga el robot.
@param imgBase64 Es la url de la imagen que dispondra el robot
@param jobId Es el id generado por el servidor en la ruta scan
@param imgName Nombre de la imagen que tendra la imagen junto al id unico.
*/

export const imageHandler = (imgBase64, jobId, imgName) => {
    try {
        //temporalmente se convierte en buffer binario
        const buffer = Buffer.from(imgBase64, 'base64');

        //creamos el nuevo nombre que tendra la imagen
        const newName = `${jobId}_${imgName.toLowerCase().replace(/ /g, "_")}.jpg`;

        const pathUpload = path.join(process.cwd(), 'src', 'public', 'uploads', newName);

        //finalmente se escribe el archivo en la carpeta que se le indico
        fs.writeFile(pathUpload, buffer);

        //se retorna al robot para que use
        const baseUrl = process.env.BACKEND_URL || "http://localhost:3000";
        console.log(`${colorize("[SERVER]", "green")} La imagen se guardo exitosamente`)
        return `${baseUrl}/public/uploads/${newName}`;
    } catch (error) {
        console.log(`${colorize("[ERROR]", "red")} Fallo en el handler: ${error}`)
        return null;
    }
};
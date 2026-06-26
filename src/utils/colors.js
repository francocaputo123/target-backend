/*
Archivo de utilidad para los colores de los logs
*/

import { styleText } from "node:util"

const COLORS = {
    red: "red",
    green: "green",
    yellow: "yellow",
    blue: "blue",
    bgRed: "bgRed",
    bgGreen: "bgGreen"
};

/**
Parametros:
text : Texto a colorear
color : color a elegir
*/

export const colorize = (text, color) => {
    const validColor = COLORS[color]

    if(!validColor) {
        return text
    }

    return styleText(validColor, text)
}
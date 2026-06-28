import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

async function extraerIdentidad(urlObjetivo) {
  let navegador;

  try {
    navegador = await puppeteer.launch({ headless: 'shell' });
    const pagina = await navegador.newPage();
    await pagina.goto(urlObjetivo, { waitUntil: 'networkidle2', timeout: 60000 });
    const codigoHtml = await pagina.content();
    await navegador.close();
    navegador = null;

    const $ = cheerio.load(codigoHtml);
    const titulo      = $('title').text().trim()                              || 'Sin título';
    const descripcion = $('meta[name="description"]').attr('content')         || 'Sin descripción';
    const idioma      = $('html').attr('lang')                                || 'No declarado';
    const openGraph = {
      type:        $('meta[property="og:type"]').attr('content')        || 'No declarado',
      title:       $('meta[property="og:title"]').attr('content')       || 'No declarado',
      image:       $('meta[property="og:image"]').attr('content')       || 'No declarado',
      description: $('meta[property="og:description"]').attr('content') || 'No declarado',
    };

    return { titulo, descripcion, idioma, openGraph };

  } catch (error) {
    if (navegador) await navegador.close();
    throw new Error(`[extraerIdentidad] Falla: ${error.message}`);
  }
}

export default extraerIdentidad;

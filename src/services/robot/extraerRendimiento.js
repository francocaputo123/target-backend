import puppeteer from 'puppeteer';

async function extraerRendimiento(urlObjetivo) {
  let navegador;

  try {
    navegador = await puppeteer.launch({ headless: 'shell' });
    const pagina = await navegador.newPage();

    const tiempoInicio = Date.now();
    const respuestaRed = await pagina.goto(urlObjetivo, { waitUntil: 'networkidle2', timeout: 60000 });
    const tiempoRespuestaMs = Date.now() - tiempoInicio;

    const codigoHtml      = await pagina.content();
    const pesoDocumentoKb = (Buffer.byteLength(codigoHtml, 'utf8') / 1024).toFixed(2);
    const statusHTTP      = respuestaRed.status();
    const metricas        = await pagina.metrics();
    const timestampCaptura = new Date().toISOString();

    const screenshotBase64 = await pagina.screenshot({
      type:     'jpeg',
      quality:  80,
      fullPage: false,
      encoding: 'base64',
    });

    await navegador.close();
    navegador = null;

    return {
      carga: {
        tiempoRespuestaMs,
        pesoDocumentoKb: parseFloat(pesoDocumentoKb),
        statusHTTP,
      },
      motorV8: {
        nodosDom:        Math.round(metricas.Nodes),
        usadoHeapJsMb:   (metricas.JSHeapUsedSize  / 1024 / 1024).toFixed(2),
        totalHeapJsMb:   (metricas.JSHeapTotalSize / 1024 / 1024).toFixed(2),
        cantidadLayouts: Math.round(metricas.LayoutCount),
        cantidadScripts: Math.round(metricas.ScriptDuration * 1000),
      },
      captura: {
        timestamp:    timestampCaptura,
        formato:      'jpeg',
        imagenBase64: screenshotBase64,
      },
    };

  } catch (error) {
    if (navegador) await navegador.close();
    throw new Error(`[extraerRendimiento] Falla: ${error.message}`);
  }
}

export default extraerRendimiento;

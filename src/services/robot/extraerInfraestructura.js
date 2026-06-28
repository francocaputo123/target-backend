import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import auditarCabeceras from './auditoria.js';
import detectarWAF from './waf.js';
import extraerSSL from './ssl.js';

async function extraerInfraestructura(urlObjetivo) {
  let navegador;

  try {
    navegador = await puppeteer.launch({ headless: 'shell' });
    const pagina = await navegador.newPage();

    const respuestaRed = await pagina.goto(urlObjetivo, { waitUntil: 'networkidle2', timeout: 60000 });
    const codigoHtml   = await pagina.content();
    const cabeceras    = respuestaRed.headers();

    const servidorWeb       = cabeceras['server']       || 'Desconocido/Oculto';
    const tecnologiaBackend = cabeceras['x-powered-by'] || 'Desconocido/Oculto';

    const tecnologiasJs = await pagina.evaluate(() => ({
      react:            typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined',
      vue:              typeof window.__VUE__                        !== 'undefined',
      angular:          typeof window.angular                        !== 'undefined',
      nextJs:           typeof window.__NEXT_DATA__                  !== 'undefined',
      nuxtJs:           typeof window.__NUXT__                       !== 'undefined',
      gatsby:           typeof window.___gatsby                      !== 'undefined',
      jQuery:           typeof window.jQuery !== 'undefined' || typeof window.$ !== 'undefined',
      googleAnalytics:  typeof window.ga     !== 'undefined' || typeof window.gtag !== 'undefined',
      googleTagManager: typeof window.google_tag_manager             !== 'undefined',
    }));

    await navegador.close();
    navegador = null;

    const $ = cheerio.load(codigoHtml);

    let frameworkFront = 'Desconocido';
    if      (tecnologiasJs.nextJs)                          frameworkFront = 'Next.js (React)';
    else if (tecnologiasJs.nuxtJs)                          frameworkFront = 'Nuxt.js (Vue)';
    else if (tecnologiasJs.gatsby)                          frameworkFront = 'Gatsby (React)';
    else if (tecnologiasJs.react)                           frameworkFront = 'React';
    else if (tecnologiasJs.vue)                             frameworkFront = 'Vue';
    else if (tecnologiasJs.angular)                         frameworkFront = 'Angular';
    else if ($('[data-reactroot], #root').length > 0)       frameworkFront = 'React (DOM)';
    else if ($('[data-v-app], #app').length > 0)            frameworkFront = 'Vue (DOM)';
    else if ($('[ng-version], [ng-app]').length > 0)        frameworkFront = 'Angular (DOM)';

    let lenguaje = 'HTML Estático / Desconocido';
    const generator = $('meta[name="generator"]').attr('content') || '';
    if      (generator.toLowerCase().includes('wordpress')) lenguaje = 'PHP (WordPress)';
    else if (generator.toLowerCase().includes('joomla'))    lenguaje = 'PHP (Joomla)';
    else if (generator.toLowerCase().includes('drupal'))    lenguaje = 'PHP (Drupal)';

    const ssl      = extraerSSL(respuestaRed);
    const waf      = detectarWAF(cabeceras);
    const cabecSeg = auditarCabeceras(cabeceras);

    return {
      servidor: {
        web:     servidorWeb,
        backend: tecnologiaBackend,
      },
      frontend: {
        framework:   frameworkFront,
        lenguajeCms: lenguaje,
        librerias: {
          jQuery:           tecnologiasJs.jQuery,
          googleAnalytics:  tecnologiasJs.googleAnalytics,
          googleTagManager: tecnologiasJs.googleTagManager,
        },
      },
      seguridad: {
        ssl,
        waf,
        cabecerasHttp: cabecSeg,
      },
    };

  } catch (error) {
    if (navegador) await navegador.close();
    throw new Error(`[extraerInfraestructura] Falla: ${error.message}`);
  }
}

export default extraerInfraestructura;

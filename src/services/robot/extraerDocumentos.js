import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const TIPOS_DOCUMENTO = {
  pdf:          ['pdf'],
  documento:    ['doc', 'docx', 'odt', 'rtf', 'txt'],
  hoja_calculo: ['xls', 'xlsx', 'ods', 'csv'],
  presentacion: ['ppt', 'pptx', 'odp'],
  comprimido:   ['zip', 'rar', '7z', 'tar', 'gz'],
  imagen:       ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
  audio:        ['mp3', 'wav', 'ogg', 'flac'],
  video:        ['mp4', 'avi', 'mkv', 'mov', 'webm'],
  codigo:       ['json', 'xml', 'yaml', 'yml', 'js', 'css'],
  otro:         []
};

function detectarTipo(href) {
  const path      = href.split('?')[0].split('#')[0];
  const extension = path.split('.').pop().toLowerCase();
  for (const [tipo, extensiones] of Object.entries(TIPOS_DOCUMENTO)) {
    if (extensiones.includes(extension)) return tipo;
  }
  return 'otro';
}

function resolverUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

async function extraerDocumentos(urlObjetivo) {
  let navegador;

  try {
    navegador = await puppeteer.launch({ headless: 'shell' });
    const pagina = await navegador.newPage();
    await pagina.goto(urlObjetivo, { waitUntil: 'networkidle2' });
    const codigoHtml = await pagina.content();
    await navegador.close();
    navegador = null;

    const $ = cheerio.load(codigoHtml);
    const documentosEncontrados = new Map();

    $('a[href]').each((_, elemento) => {
      const hrefRaw = $(elemento).attr('href');
      if (!hrefRaw || hrefRaw.startsWith('mailto:') || hrefRaw.startsWith('tel:')) return;

      const urlAbsoluta = resolverUrl(hrefRaw, urlObjetivo);
      if (!urlAbsoluta) return;

      const tipo = detectarTipo(urlAbsoluta);
      if (tipo === 'otro') return;

      if (!documentosEncontrados.has(urlAbsoluta)) {
        documentosEncontrados.set(urlAbsoluta, {
          url:         urlAbsoluta,
          tipo,
          textoLink:   $(elemento).text().trim() || '(sin texto)',
          atributo:    'href',
          descargable: $(elemento).attr('download') !== undefined
        });
      }
    });

    $('source[src], embed[src], iframe[src], object[data]').each((_, elemento) => {
      const tag      = elemento.tagName.toLowerCase();
      const atributo = tag === 'object' ? 'data' : 'src';
      const srcRaw   = $(elemento).attr(atributo);
      if (!srcRaw) return;

      const urlAbsoluta = resolverUrl(srcRaw, urlObjetivo);
      if (!urlAbsoluta) return;

      const tipo = detectarTipo(urlAbsoluta);
      if (tipo === 'otro') return;

      if (!documentosEncontrados.has(urlAbsoluta)) {
        documentosEncontrados.set(urlAbsoluta, {
          url:         urlAbsoluta,
          tipo,
          textoLink:   `(embebido en <${tag}>)`,
          atributo,
          descargable: false
        });
      }
    });

    const listaFinal = Array.from(documentosEncontrados.values());

    const agrupado = {};
    for (const tipo of Object.keys(TIPOS_DOCUMENTO)) {
      const archivosDelTipo = listaFinal.filter(doc => doc.tipo === tipo);
      if (archivosDelTipo.length > 0) agrupado[tipo] = archivosDelTipo;
    }

    return {
      totalDocumentos: listaFinal.length,
      resumen: Object.fromEntries(
        Object.entries(agrupado).map(([tipo, docs]) => [tipo, docs.length])
      ),
      documentos: agrupado
    };

  } catch (error) {
    if (navegador) await navegador.close();
    throw new Error(`[extraerDocumentos] Falla: ${error.message}`);
  }
}

export default extraerDocumentos;

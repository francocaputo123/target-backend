import { promises as dns } from 'dns';
import net from 'net';
import puppeteer from 'puppeteer';

const RANGOS_CDN = [
  { inicio: '104.16.0.0',   fin: '104.31.255.255', nombre: 'Cloudflare' },
  { inicio: '172.64.0.0',   fin: '172.71.255.255', nombre: 'Cloudflare' },
  { inicio: '198.41.128.0', fin: '198.41.255.255', nombre: 'Cloudflare' },
  { inicio: '151.101.0.0',  fin: '151.101.255.255', nombre: 'Fastly'    },
  { inicio: '23.32.0.0',    fin: '23.67.255.255',  nombre: 'Akamai'     },
];

function ipANumero(ip) {
  return ip.split('.').reduce((acc, octeto) => (acc << 8) + parseInt(octeto), 0) >>> 0;
}

function detectarCdn(ip) {
  if (!net.isIPv4(ip)) return null;
  const num = ipANumero(ip);
  for (const rango of RANGOS_CDN) {
    if (num >= ipANumero(rango.inicio) && num <= ipANumero(rango.fin)) {
      return rango.nombre;
    }
  }
  return null;
}

async function resolverConDns(dominio) {
  try {
    const { address, family } = await dns.lookup(dominio);

    let registrosMx  = [];
    let registrosNs  = [];
    let registrosTxt = [];

    try {
      const mx = await dns.resolveMx(dominio);
      registrosMx = mx.map(r => ({ prioridad: r.priority, servidor: r.exchange }));
    } catch { /* algunos dominios no tienen MX */ }

    try {
      registrosNs = await dns.resolveNs(dominio);
    } catch { /* puede estar restringido */ }

    try {
      const txt = await dns.resolveTxt(dominio);
      registrosTxt = txt.map(r => r.join(''));
    } catch { /* puede estar restringido */ }

    return {
      exito: true,
      ip: address,
      versionIp: `IPv${family}`,
      registros: { mx: registrosMx, ns: registrosNs, txt: registrosTxt }
    };

  } catch (error) {
    return { exito: false, error: error.message };
  }
}

async function resolverConPuppeteer(urlObjetivo) {
  let navegador;
  try {
    navegador = await puppeteer.launch({ headless: 'shell' });
    const pagina = await navegador.newPage();

    await pagina.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/124.0.0.0 Safari/537.36'
    );

    const cliente = await pagina.target().createCDPSession();
    await cliente.send('Network.enable');

    let ipInterceptada = null;

    cliente.on('Network.responseReceived', evento => {
      if (!ipInterceptada && evento.response.remoteIPAddress) {
        ipInterceptada = evento.response.remoteIPAddress.replace(/^\[|\]$/g, '');
      }
    });

    await pagina.goto(urlObjetivo, { waitUntil: 'networkidle2' });
    await navegador.close();
    navegador = null;

    if (ipInterceptada) {
      return { exito: true, ip: ipInterceptada, metodo: 'CDP intercepción TCP' };
    }
    return { exito: false, error: 'No se pudo interceptar la IP de conexión' };

  } catch (error) {
    if (navegador) await navegador.close();
    return { exito: false, error: error.message };
  }
}

async function extraerIpYRed(urlObjetivo) {
  try {
    const dominio      = new URL(urlObjetivo).hostname;
    const resultadoDns = await resolverConDns(dominio);

    let ipFinal       = null;
    let versionIp     = null;
    let metodoUsado   = null;
    let cdnDetectado  = null;
    let fallbackUsado = false;
    let registros     = { mx: [], ns: [], txt: [] };

    if (resultadoDns.exito) {
      ipFinal      = resultadoDns.ip;
      versionIp    = resultadoDns.versionIp;
      metodoUsado  = 'DNS lookup (sistema operativo)';
      registros    = resultadoDns.registros;
      cdnDetectado = detectarCdn(ipFinal);

      if (cdnDetectado) {
        const resultadoPuppeteer = await resolverConPuppeteer(urlObjetivo);
        fallbackUsado = true;
        if (resultadoPuppeteer.exito && resultadoPuppeteer.ip !== ipFinal) {
          ipFinal     = resultadoPuppeteer.ip;
          metodoUsado = resultadoPuppeteer.metodo;
        }
      }

    } else {
      fallbackUsado = true;
      const resultadoPuppeteer = await resolverConPuppeteer(urlObjetivo);
      if (resultadoPuppeteer.exito) {
        ipFinal     = resultadoPuppeteer.ip;
        versionIp   = net.isIPv6(ipFinal) ? 'IPv6' : 'IPv4';
        metodoUsado = resultadoPuppeteer.metodo;
      } else {
        throw new Error(`DNS: ${resultadoDns.error} | Puppeteer: ${resultadoPuppeteer.error}`);
      }
    }

    return {
      dominio,
      ip:                    ipFinal,
      versionIp,
      metodoResolucion:      metodoUsado,
      fallbackPuppeteerUsado: fallbackUsado,
      proteccionCdn: cdnDetectado
        ? { detectado: true,  proveedor: cdnDetectado }
        : { detectado: false, proveedor: null },
      registrosDns: registros
    };

  } catch (error) {
    throw new Error(`[extraerIpYRed] Falla: ${error.message}`);
  }
}

export default extraerIpYRed;

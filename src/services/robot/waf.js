const FIRMAS_WAF = [
  { nombre: 'Cloudflare', campo: 'server',      patron: /cloudflare/i },
  { nombre: 'Cloudflare', campo: 'cf-ray',      patron: /.+/          },
  { nombre: 'Akamai',     campo: 'server',      patron: /akamai/i     },
  { nombre: 'Sucuri',     campo: 'server',      patron: /sucuri/i     },
  { nombre: 'Sucuri',     campo: 'x-sucuri-id', patron: /.+/          },
  { nombre: 'AWS WAF',    campo: 'server',      patron: /awselb/i     },
  { nombre: 'Imperva',    campo: 'server',      patron: /incapsula/i  },
];

function extraerInfoCloudflare(headers) {
  const cfRay = headers['cf-ray'];
  if (!cfRay) return null;

  const partes     = cfRay.split('-');
  const datacenter = partes.length > 1 ? partes[partes.length - 1] : 'desconocido';
  const cfCache    = headers['cf-cache-status'] || 'no disponible';

  return {
    rayId:       cfRay,
    datacenter,
    cacheStatus: cfCache,
  };
}

// Si no se detecta ningún WAF no significa que no tenga protección,
// algunos están configurados para no revelar su presencia.
function detectarWAF(headers) {
  const detectados = [];

  for (const firma of FIRMAS_WAF) {
    const valor = headers[firma.campo] || '';
    if (firma.patron.test(valor) && !detectados.includes(firma.nombre)) {
      detectados.push(firma.nombre);
    }
  }

  const info = {};
  if (detectados.includes('Cloudflare')) {
    info.cloudflare = extraerInfoCloudflare(headers);
  }

  return {
    detectado:   detectados.length > 0,
    proveedores: detectados,
    info,
  };
}

export default detectarWAF;

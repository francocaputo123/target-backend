const CABECERAS_SEGURIDAD = [
  'content-security-policy',
  'x-frame-options',
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
];

function parsearCSP(valorCSP) {
  const directivasClave = ['default-src', 'script-src', 'object-src'];
  const resultado = {};

  for (const directiva of directivasClave) {
    const match = valorCSP.match(new RegExp(`${directiva}([^;]+)`));
    resultado[directiva] = match ? match[1].trim() : 'no definida';
  }

  return resultado;
}

function auditarCabeceras(headers) {
  const presentes = [];
  const ausentes  = [];

  for (const nombre of CABECERAS_SEGURIDAD) {
    if (headers[nombre]) {
      const valor = nombre === 'content-security-policy'
        ? parsearCSP(headers[nombre])
        : headers[nombre];

      presentes.push({ nombre, valor });
    } else {
      ausentes.push(nombre);
    }
  }

  const puntaje = Math.round((presentes.length / CABECERAS_SEGURIDAD.length) * 100);

  return { puntaje, presentes, ausentes };
}

export default auditarCabeceras;

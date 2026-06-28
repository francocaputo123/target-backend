function extraerSSL(respuestaRed) {
  const cert = respuestaRed.securityDetails();

  if (!cert) {
    return {
      valido:        false,
      ca:            null,
      protocolo:     null,
      dominio:       null,
      emision:       null,
      vencimiento:   null,
      duracionDias:  null,
      diasRestantes: null,
      alerta:        null,
    };
  }

  const vencimientoMs = cert.validTo()   * 1000;
  const emisionMs     = cert.validFrom() * 1000;
  const vencimiento   = new Date(vencimientoMs).toISOString().slice(0, 10);
  const emision       = new Date(emisionMs).toISOString().slice(0, 10);
  const diasRestantes = Math.floor((vencimientoMs - Date.now()) / 86_400_000);
  const duracionDias  = Math.floor((vencimientoMs - emisionMs) / 86_400_000);

  return {
    valido:        true,
    ca:            cert.issuer(),
    protocolo:     cert.protocol(),
    dominio:       cert.subjectName(),
    emision,
    vencimiento,
    duracionDias,
    diasRestantes,
    alerta:        diasRestantes <= 30 ? `Vence en ${diasRestantes} días` : null,
  };
}

export default extraerSSL;

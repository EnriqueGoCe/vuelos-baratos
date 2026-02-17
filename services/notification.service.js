const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

/**
 * Envia email de alerta de precio bajo
 */
async function sendPriceAlert(user, alert, currentPrice, bestOffer) {
  const mail = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  const outboundFirst = bestOffer.outbound?.[0];
  const departureTime = outboundFirst
    ? new Date(outboundFirst.departure).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
    : alert.departure_date;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">&#9992; Precio bajo encontrado!</h1>
      </div>
      <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
        <p>Hola <strong>${user.name}</strong>,</p>
        <p>Encontramos un vuelo de <strong>${alert.origin}</strong> a <strong>${alert.destination}</strong> por debajo de tu precio objetivo:</p>

        <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <div style="font-size: 36px; font-weight: bold; color: #16a34a;">${currentPrice} ${alert.currency}</div>
          <div style="color: #666; margin-top: 5px;">Tu objetivo: ${alert.target_price} ${alert.currency}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Ruta</td><td style="padding: 8px 0; font-weight: bold;">${alert.origin} → ${alert.destination}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Fecha</td><td style="padding: 8px 0;">${departureTime}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Aerolinea</td><td style="padding: 8px 0;">${outboundFirst?.airlineName || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Escalas</td><td style="padding: 8px 0;">${bestOffer.stops === 0 ? 'Directo' : bestOffer.stops + ' escala(s)'}</td></tr>
        </table>

        ${bestOffer.deepLink ? `<a href="${bestOffer.deepLink}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">Reservar ahora</a>` : ''}

        <p style="color: #999; margin-top: 30px; font-size: 12px;">
          Recibes este email porque configuraste una alerta de precio en Vuelos Baratos.
        </p>
      </div>
    </div>
  `;

  await mail.sendMail({
    from,
    to: user.email,
    subject: `✈️ ${alert.origin}→${alert.destination}: ${currentPrice}${alert.currency} (bajo tu objetivo de ${alert.target_price}${alert.currency})`,
    html
  });
}

module.exports = { sendPriceAlert };

/**
 * MTP PLATFORM — Redsys / CaixaBank Cyberpac.
 */
import crypto from 'node:crypto';

const REDSYS_URLS = {
  test:       'https://sis-t.redsys.es:25443/sis/realizarPago',
  production: 'https://sis.redsys.es/sis/realizarPago',
};

const ENV = process.env.REDSYS_ENVIRONMENT || 'test';
const MERCHANT_CODE = process.env.REDSYS_MERCHANT_CODE || '';
const TERMINAL = process.env.REDSYS_TERMINAL || '1';
const CURRENCY = process.env.REDSYS_CURRENCY || '978';
const SECRET_KEY = process.env.REDSYS_SECRET_KEY || '';

export function redsysHealth() {
  return {
    configured: !!(MERCHANT_CODE && SECRET_KEY),
    environment: ENV,
    endpoint: REDSYS_URLS[ENV],
    merchant_code: MERCHANT_CODE ? `***${MERCHANT_CODE.slice(-4)}` : null,
  };
}

export function generateOrderId() {
  return Date.now().toString().slice(-4) + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function tripleDesEncrypt(message, key) {
  const iv = Buffer.alloc(8, 0);
  const cipher = crypto.createCipheriv('des-ede3-cbc', Buffer.from(key, 'base64'), iv);
  cipher.setAutoPadding(false);
  const buf = Buffer.from(message, 'utf8');
  const padded = Buffer.concat([buf, Buffer.alloc(8 - (buf.length % 8 || 8), 0)]);
  return Buffer.concat([cipher.update(padded), cipher.final()]);
}

function sign(payloadBase64, orderId) {
  const derivedKey = tripleDesEncrypt(orderId, SECRET_KEY);
  return crypto.createHmac('sha256', derivedKey).update(payloadBase64).digest('base64');
}

export function createPayment({ orderId, amount, description, userId }) {
  if (!MERCHANT_CODE || !SECRET_KEY) throw new Error('Redsys no está configurado. Revisá REDSYS_MERCHANT_CODE y REDSYS_SECRET_KEY.');
  if (!orderId || !amount) throw new Error('orderId y amount son obligatorios');

  const payload = {
    DS_MERCHANT_AMOUNT: String(amount),
    DS_MERCHANT_ORDER: orderId,
    DS_MERCHANT_MERCHANTCODE: MERCHANT_CODE,
    DS_MERCHANT_CURRENCY: CURRENCY,
    DS_MERCHANT_TRANSACTIONTYPE: '0',
    DS_MERCHANT_TERMINAL: TERMINAL,
    DS_MERCHANT_MERCHANTURL: process.env.REDSYS_NOTIFICATION_URL || '',
    DS_MERCHANT_URLOK:       process.env.REDSYS_OK_URL || '',
    DS_MERCHANT_URLKO:       process.env.REDSYS_KO_URL || '',
    DS_MERCHANT_PRODUCTDESCRIPTION: description || 'MTP Platform',
    DS_MERCHANT_TITULAR: userId || 'usuario',
    DS_MERCHANT_CONSUMERLANGUAGE: '001',
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  return {
    url: REDSYS_URLS[ENV],
    Ds_SignatureVersion: 'HMAC_SHA256_V1',
    Ds_MerchantParameters: payloadBase64,
    Ds_Signature: sign(payloadBase64, orderId),
  };
}

export function verifyNotification(body) {
  const params = body.Ds_MerchantParameters;
  const receivedSig = body.Ds_Signature;
  if (!params || !receivedSig) return { valid: false, error: 'Faltan parámetros' };

  const decoded = JSON.parse(Buffer.from(params, 'base64').toString('utf8'));
  const orderId = decoded.Ds_Order || decoded.DS_MERCHANT_ORDER;
  if (!orderId) return { valid: false, error: 'Orden no encontrada' };

  const expectedSig = sign(params, orderId).replace(/\+/g, '-').replace(/\//g, '_');
  const incomingSig = receivedSig.replace(/\+/g, '-').replace(/\//g, '_');

  const valid = expectedSig === incomingSig;
  const responseCode = Number(decoded.Ds_Response || 9999);
  const status = valid && responseCode < 100 ? 'aprobado' : valid ? 'denegado' : 'firma_invalida';

  return {
    valid, status, orderId,
    amount: Number(decoded.Ds_Amount || 0),
    response_code: responseCode,
    authorization_code: decoded.Ds_AuthorisationCode || null,
    decoded,
  };
}

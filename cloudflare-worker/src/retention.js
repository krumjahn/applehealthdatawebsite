import 'reflect-metadata';
import {
  BasicConstraintsExtension,
  KeyUsageFlags,
  KeyUsagesExtension,
  X509Certificate
} from '@peculiar/x509';

export const RETENTION_PATH = '/retention-messaging-api/';
export const APP_APPLE_ID = 6749297170;

const PRODUCT_IDS = new Set([
  'com.rumjahn.healthkitanalyzer.Monthly',
  'com.rumjahn.healthkitanalyzer.Annual'
]);

const MESSAGE_IDS = Object.freeze({
  'ar-SA': '97e52279-18f7-4334-9f62-413a7898d56e',
  'de-DE': '4bf0ac24-547c-463c-ada1-64d23d9339da',
  'en-US': '4071fe25-978e-41eb-bb17-83a065948082',
  'es-ES': 'c38e75a8-8917-44c1-9f92-d3b81396a394',
  'fr-FR': '96de9562-4c88-4d29-a386-9b4b4febf377',
  ja: 'd3aa8406-04e7-41f9-be03-37825a88f4f0',
  ko: 'cafd9e1e-7f6c-44de-84cd-19a766429529',
  'pt-BR': '2b9b41af-bc5a-4ae6-be96-fefea78c4d06',
  ru: '563138f4-f64d-4e99-a90f-9ca83479e2a0',
  'zh-Hans': '78965ffe-065b-462d-b89d-fa97d9a9f3b1',
  'zh-Hant': 'feab2b47-a723-4df9-be0b-b530df83eac0'
});

// SHA-256 fingerprints of the three roots Apple documents for App Store JWS validation.
const APPLE_ROOT_SHA256 = new Set([
  'B0B1730ECBC7FF4505142C49F1295E6EDA6BCAED7E2C68C5BE91B5A11001F024',
  'C2B9B042DD57830E7D117DAC55AC8AE19407D38E41D88F3215BC3A890444A050',
  '63343ABFB89A6A03EBB57E9B3F5FA7BE7C4F5C756F3017B3A8C488C3653E9179'
]);

const APPLE_WWDR_INTERMEDIATE_OID = '1.2.840.113635.100.6.2.1';
const MAX_SIGNED_AGE_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 16 * 1024;

export async function handleRetentionMessage(request, verify = verifyAppleSignedPayload) {
  const headers = { 'Cache-Control': 'no-store' };

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, {
      ...headers,
      Allow: 'POST'
    });
  }

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: 'Request body too large' }, 413, headers);
  }

  let body;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Request body too large' }, 413, headers);
    }
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, headers);
  }

  if (!body || typeof body.signedPayload !== 'string') {
    return jsonResponse({ error: 'Missing signedPayload' }, 400, headers);
  }

  try {
    const payload = await verify(body.signedPayload);
    const messageIdentifier = chooseMessage(payload);
    return jsonResponse({ message: { messageIdentifier } }, 200, headers);
  } catch (error) {
    // Do not expose signature or account-validation details to callers.
    console.warn('Rejected retention messaging request', errorMessage(error));
    return jsonResponse({ error: 'Invalid signedPayload' }, 400, headers);
  }
}

export async function verifyAppleSignedPayload(signedPayload, now = new Date()) {
  const parts = signedPayload.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error('Malformed compact JWS');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJson(encodedHeader);
  const payload = decodeJson(encodedPayload);

  if (header.alg !== 'ES256' || !Array.isArray(header.x5c) || header.x5c.length !== 3) {
    throw new Error('Unexpected JWS header');
  }

  const signedDate = new Date(payload.signedDate);
  if (!Number.isFinite(signedDate.getTime())) throw new Error('Invalid signedDate');
  if (Math.abs(now.getTime() - signedDate.getTime()) > MAX_SIGNED_AGE_MS) {
    throw new Error('Stale signedPayload');
  }

  const certificates = header.x5c.map(decodeCertificate);
  const [leaf, intermediate, root] = certificates;
  await verifyCertificateChain(leaf, intermediate, root, signedDate);

  const signature = decodeBase64Url(encodedSignature);
  if (signature.byteLength !== 64) throw new Error('Invalid ES256 signature length');

  const signedData = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signatureIsValid = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    leaf.publicKey,
    signature,
    signedData
  );
  if (!signatureIsValid) throw new Error('Invalid JWS signature');

  validatePayload(payload);
  return payload;
}

async function verifyCertificateChain(leaf, intermediate, root, signedDate) {
  const rootFingerprint = toHex(await root.getThumbprint('SHA-256'));
  if (!APPLE_ROOT_SHA256.has(rootFingerprint)) throw new Error('Untrusted root certificate');
  if (!(await root.isSelfSigned())) throw new Error('Invalid root certificate');

  assertCertificateAuthority(root, 'root');
  assertCertificateAuthority(intermediate, 'intermediate');

  if (!intermediate.getExtension(APPLE_WWDR_INTERMEDIATE_OID)) {
    throw new Error('Missing Apple WWDR intermediate extension');
  }

  if (!(await intermediate.verify({ date: signedDate, publicKey: root.publicKey }))) {
    throw new Error('Invalid intermediate certificate');
  }
  if (!(await leaf.verify({ date: signedDate, publicKey: intermediate.publicKey }))) {
    throw new Error('Invalid leaf certificate');
  }

  const leafUsage = leaf.getExtension(KeyUsagesExtension);
  if (leafUsage && !(leafUsage.usages & KeyUsageFlags.digitalSignature)) {
    throw new Error('Leaf certificate cannot sign data');
  }
}

function assertCertificateAuthority(certificate, name) {
  const constraints = certificate.getExtension(BasicConstraintsExtension);
  const usage = certificate.getExtension(KeyUsagesExtension);
  if (!constraints?.ca) throw new Error(`${name} certificate is not a CA`);
  if (usage && !(usage.usages & KeyUsageFlags.keyCertSign)) {
    throw new Error(`${name} certificate cannot sign certificates`);
  }
}

function validatePayload(payload) {
  if (Number(payload.appAppleId) !== APP_APPLE_ID) throw new Error('Wrong appAppleId');
  if (!PRODUCT_IDS.has(payload.productId)) throw new Error('Unknown productId');
  if (!['Production', 'Sandbox'].includes(payload.environment)) throw new Error('Unknown environment');
  if (typeof payload.originalTransactionId !== 'string' || !payload.originalTransactionId) {
    throw new Error('Missing originalTransactionId');
  }
  if (typeof payload.requestIdentifier !== 'string' || !payload.requestIdentifier) {
    throw new Error('Missing requestIdentifier');
  }
  if (typeof payload.userLocale !== 'string' || !payload.userLocale) {
    throw new Error('Missing userLocale');
  }
}

export function chooseMessage(payload) {
  if (Number(payload.appAppleId) !== APP_APPLE_ID) throw new Error('Wrong appAppleId');
  if (!PRODUCT_IDS.has(payload.productId)) throw new Error('Unknown productId');

  const locale = normalizeLocale(payload.userLocale);
  const messageIdentifier = MESSAGE_IDS[locale];
  if (!messageIdentifier) throw new Error('Unsupported locale');
  return messageIdentifier;
}

export function normalizeLocale(value) {
  const normalized = String(value || '').replaceAll('_', '-');
  const exact = Object.keys(MESSAGE_IDS).find(
    (locale) => locale.toLowerCase() === normalized.toLowerCase()
  );
  if (exact) return exact;

  const language = normalized.split('-')[0].toLowerCase();
  const matches = Object.keys(MESSAGE_IDS).filter(
    (locale) => locale.split('-')[0].toLowerCase() === language
  );
  return matches.length === 1 ? matches[0] : normalized;
}

function decodeJson(encoded) {
  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(encoded)));
  } catch {
    throw new Error('Invalid Base64URL JSON');
  }
}

function decodeBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid Base64URL');
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function decodeCertificate(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error('Invalid x5c certificate');
  }
  const binary = atob(value);
  return new X509Certificate(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function jsonResponse(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function errorMessage(error) {
  return error instanceof Error ? error.message : 'Unknown error';
}

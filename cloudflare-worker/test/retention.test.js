import assert from 'node:assert/strict';
import test from 'node:test';

import {
  APP_APPLE_ID,
  chooseMessage,
  handleRetentionMessage,
  normalizeLocale,
  verifyAppleSignedPayload
} from '../src/retention.js';

const validPayload = {
  appAppleId: APP_APPLE_ID,
  productId: 'com.rumjahn.healthkitanalyzer.Monthly',
  userLocale: 'en-US',
  originalTransactionId: '2000000000000000',
  requestIdentifier: '7a892574-cbcb-4c16-9d8d-2d8ccdcfc22a',
  environment: 'Production',
  signedDate: Date.now()
};

test('serves the approved message identifier for a verified request', async () => {
  const request = new Request('https://applehealthdata.com/retention-messaging-api/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signedPayload: 'verified-by-test-double' })
  });

  const response = await handleRetentionMessage(request, async () => validPayload);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await response.json(), {
    message: { messageIdentifier: '4071fe25-978e-41eb-bb17-83a065948082' }
  });
});

test('normalizes locale variants without guessing ambiguous Chinese variants', () => {
  assert.equal(normalizeLocale('EN_us'), 'en-US');
  assert.equal(normalizeLocale('ja-JP'), 'ja');
  assert.equal(normalizeLocale('zh-CN'), 'zh-CN');
  assert.equal(chooseMessage({ ...validPayload, userLocale: 'pt_BR' }), '2b9b41af-bc5a-4ae6-be96-fefea78c4d06');
});

test('rejects unknown apps, products, and locales', () => {
  assert.throws(() => chooseMessage({ ...validPayload, appAppleId: 1 }), /appAppleId/);
  assert.throws(() => chooseMessage({ ...validPayload, productId: 'other' }), /productId/);
  assert.throws(() => chooseMessage({ ...validPayload, userLocale: 'nl-NL' }), /locale/);
});

test('fails closed for malformed requests and never proxies the endpoint', async () => {
  const getResponse = await handleRetentionMessage(
    new Request('https://applehealthdata.com/retention-messaging-api/')
  );
  assert.equal(getResponse.status, 405);

  const invalidJsonResponse = await handleRetentionMessage(
    new Request('https://applehealthdata.com/retention-messaging-api/', {
      method: 'POST',
      body: '{'
    })
  );
  assert.equal(invalidJsonResponse.status, 400);

  const missingPayloadResponse = await handleRetentionMessage(
    new Request('https://applehealthdata.com/retention-messaging-api/', {
      method: 'POST',
      body: '{}'
    })
  );
  assert.equal(missingPayloadResponse.status, 400);

  await assert.rejects(() => verifyAppleSignedPayload('not.a.jws'), /Base64URL|header/);
});

test('rejects a verified request that does not map to a configured message', async () => {
  const request = new Request('https://applehealthdata.com/retention-messaging-api/', {
    method: 'POST',
    body: JSON.stringify({ signedPayload: 'verified-by-test-double' })
  });
  const response = await handleRetentionMessage(request, async () => ({
    ...validPayload,
    userLocale: 'nl-NL'
  }));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Invalid signedPayload' });
});

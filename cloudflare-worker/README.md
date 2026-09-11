# applehealthdata.com Cloudflare Worker

This Worker proxies the static GitHub Pages site, exposes the existing `/commits`
API, and handles Apple's Retention Messaging callback at:

`https://applehealthdata.com/retention-messaging-api/`

The retention endpoint accepts only `POST` requests containing Apple's compact
JWS `signedPayload`. Before returning a configured text-message UUID, it verifies
the ES256 signature, three-certificate chain, pinned Apple root, WWDR intermediate
extension, certificate validity at `signedDate`, request freshness, Apple app ID,
subscription product ID, environment, and locale. Invalid requests fail closed;
Apple then uses the product's configured default retention message.

```bash
npm install
npm run check
npm run deploy
```

After deployment, a `GET` request should return `405` with `Allow: POST`, while a
malformed `POST` should return `400`. Use Apple's sandbox performance test for a
real signed-payload and latency check after Retention Messaging access is granted.

References:

- <https://developer.apple.com/documentation/retentionmessaging/setting-up-retention-messaging-endpoint>
- <https://developer.apple.com/documentation/retentionmessaging/responding-to-realtime-retention-messaging-requests>
- <https://developer.apple.com/documentation/appstoreservernotifications/jwsdecodedheader>
- <https://www.apple.com/certificateauthority/>

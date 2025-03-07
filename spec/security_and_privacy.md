## Security and Privacy Considerations

### DNS Considerations

#### DNS Security Considerations

Implementers must secure DNS resolution to protect against attacks like Man in
the Middle, following the detailed guidance in the [did:web
specification](https://w3c-ccg.github.io/did-method-web/#dns-considerations).
The use of DNSSEC [[spec:RFC4033]], [[spec:RFC4034]], [[spec:RFC4035]] is
essential to prevent spoofing and ensure authenticity of DNS records.

#### DNS Privacy Considerations

Resolving a `did:webvh` identifier can expose users to tracking by DNS providers
and web servers. To mitigate this risk, it's recommended to use privacy-enhancing
technologies such as VPNs, TOR, or trusted universal resolver services, in line
with strategies outlined in the [did:web
specification](https://w3c-ccg.github.io/did-method-web/#dns-considerations)
including emerging RFCs such as [Oblivious DNS over
HTTPS](https://datatracker.ietf.org/doc/html/draft-pauly-dprive-oblivious-doh-03)
for DNS privacy.

### In-transit Security

For in-transit security, the guidance provided in the [did:web
specification](https://w3c-ccg.github.io/did-method-web/#in-transit-security)
regarding the encryption of traffic between the server and client should be
followed.

### International Domain Names

`did:webvh` implementers **MAY** publish [[ref: DID Logs]] on domains that use international domains.
 The [DID-to-HTTPS Transformation](#the-did-to-https-transformation) section of this specification
 **MUST** be followed by [[ref: DID Controllers]] and DID resolvers to ensure the proper
 handling of international domains.

### Cross-Origin Resource Sharing (CORS) Policy Considerations

To support scenarios where DID resolution is performed by client applications running in a web browser, the file served for the [[ref: DID Log]] needs to be accessible by any origin. To enable this, the [[ref: DID Log]] HTTP response MUST include the following header:

`Access-Control-Allow-Origin: *`

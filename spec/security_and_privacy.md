## Security and Privacy Considerations

### DNS Considerations

#### DNS Security Considerations

Implementers **MUST** secure DNS resolution to protect against attacks like Man in
the Middle, following the detailed guidance in the [did:web
specification](https://w3c-ccg.github.io/did-method-web/#dns-considerations).
The use of DNSSEC [[spec:RFC4033]], [[spec:RFC4034]], [[spec:RFC4035]] is
essential to prevent spoofing and ensure authenticity of DNS records.

#### DNS Privacy Considerations

Resolving a `did:webvh` identifier can expose users to tracking by DNS providers
and web servers. To mitigate this risk, it's **RECOMMENDED** to use privacy-enhancing
technologies such as VPNs, TOR, or trusted universal resolver services, in line
with strategies outlined in the [did:web
specification](https://w3c-ccg.github.io/did-method-web/#dns-considerations)
including emerging RFCs such as [Oblivious DNS over
HTTPS](https://datatracker.ietf.org/doc/html/draft-pauly-dprive-oblivious-doh-03)
for DNS privacy.

### In-transit Security

For in-transit security, the guidance provided in the [did:web
specification](https://w3c-ccg.github.io/did-method-web/#in-transit-security)
regarding the encryption of traffic between the server and client **SHOULD** be
followed. Ecosystem implementors **SHOULD** follow the same guidance for [[ref: watchers]] and [[ref: witnesses]] implementations.

### International Domain Names

`did:webvh` implementers **MAY** publish [[ref: DID Logs]] on domains that use international domains.
 The [DID-to-HTTPS Transformation](#the-did-to-https-transformation) section of this specification
 **MUST** be followed by [[ref: DID Controllers]] and DID resolvers to ensure the proper
 handling of international domains.

### Cross-Origin Resource Sharing (CORS) Policy Considerations

To support scenarios where DID resolution is performed by client applications running in a web browser, the file served for the [[ref: DID Log]] needs to be accessible by any origin. To enable this, the [[ref: DID Log]] HTTP response MUST include the following header:

`Access-Control-Allow-Origin: *`

### Publishing parallel `did:web`

`did:webvh` implementers that consider [publishing parallel `did:web` DID](#publishing-a-parallel-didweb-did) **SHOULD** evaluate
security impact from losing added security properties of `did:webvh` 
and refer to [did:web Security and Privacy Considerations](https://w3c-ccg.github.io/did-method-web/#dns-considerations) for additional guidance.

### Right to Erasure ([GDPR Art. 17](https://gdpr-info.eu/art-17-gdpr/))

While it's possible for [[ref: DID Controller]] to delete published data as described in [Deactivate (Revoke) operation](#deactivate-revoke),
it's **RECOMMENDED** for monitoring [[ref: watchers]] to cache last known state indefinitely. 
This means that ability and specific process of complete data erasure depends on [[ref: watchers]] behavior
and **SHOULD** be defined by governance of ecosystem.

### Post Quantum Attacks

`did:webvh` [[ref: Key Pre-Rotation]] approach provides enough flexibility for "post-quantum safety".
For guidance on post-quantum attacks mitigation, implementors **SHOULD** refer to [corresponding Implementation Guide section](https://didwebvh.info/latest/implementers-guide/prerotation-keys/#post-quantum-attacks).
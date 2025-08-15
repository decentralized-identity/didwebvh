## Security Considerations

This section follows the guidelines in [[spec:RFC3552]] and addresses the security requirements for all DID operations defined in the `did:webvh` method specification. It draws on the method-specific characteristics of `did:webvh` while aligning with the [[spec:DID-CORE]] requirements in [DID Core 7.3](https://www.w3.org/TR/did-core/#security-requirements).

### Threats and Attacks

Implementations of `did:webvh` **MUST** mitigate the following classes of attack for all DID operations:

- **Eavesdropping** — All network communication (e.g., retrieval of `did.jsonl`, `witness.json` files, or other DID-associated resources) **SHOULD** be performed over TLS (HTTPS). Plaintext HTTP **MUST NOT** be used except for testing or non-production deployments where confidentiality is not required. This requirement is not unique to the `did:webvh` method; its application here is as with general web traffic. The verifiability of `did:webvh` ensures that tampering with the contents of individual log entries is detectable, TLS protects against passive observation and other network-based risks.

- **Replay attacks** — Implementations **MUST** verify the DID Log (including monotonic progression and referenced hashes) and reject logs that do not verify as outlined in the [Read](#read-resolve) section of this specification.

- **Message insertion, deletion, and modification** — Each DID Log entry and witness file is integrity-protected using cryptographic signatures. Implementations **MUST** verify the DID Log and reject any log that fails verification as outlined in the [Read](#read-resolve) section of this specification.

- **Truncation or withholding of log entries** — An attacker (or misconfigured intermediary) could serve an older-but-valid prefix of the DID Log, truncating newer entries and presenting a stale DID state.
  - **Mitigations (non-exhaustive):**
    - **Resolver cache-and-compare:** Resolvers **SHOULD** remember the latest `versionId` previously observed for a DID and **SHOULD** warn or fail resolution when presented with a truncated log.
    - **Witness verification:** Where DID Controllers utilize witnesses, resolvers **MUST** verify that all entries are properly witnessed according to the [Witness Verification](#did-witnesses) section of this specification. Notably, witness proofs of unpublished or truncated entries **MUST** be ignored.
    - **Multi-source resolution:** Resolvers **MAY** attempt retrieval from multiple [`did:webvh` Watchers](#did-watchers) and detect divergence in latest entries.
    - **End-to-end TLS:** While signatures detect per-entry tampering, use of TLS **SHOULD** be enforced to reduce opportunities for active truncation in transit.

- **Denial of Service (DoS) and amplification** — Implementations **MAY** limit resource consumption by rejecting excessively large DID logs and witness proof files, and throttling repeated resolution attempts. The subjective elements of these limits (e.g., what constitutes “excessively large” or “repeated”) are ecosystem-dependent and **SHOULD** be established through community or ecosystem governance.

- **Man-in-the-middle (MitM)** — HTTPS and signature verification of DID Log entries and witness proofs protect against undetected modification of individual entries. Risks specific to withholding or truncation are addressed in **Truncation or withholding of log entries** above. Use of TLS further ensures server authenticity and reduces opportunities for active interference.

- **Conflicting parallel updates / split view** — Multiple authorized updates from the same parent entry can produce divergent logs. Publication components **MUST** enforce monotonic extension of the current tip; witnesses **MUST NOT** sign more than one child of the same parent; consolidation of `witness.json` **MUST** fail on conflicting branches. Resolvers **SHOULD** cache the highest observed version/hash and **SHOULD** detect/warn on older branches; Watchers **SHOULD** detect and report divergence across sources.

- **Other attacks** — The required `did:webvh` verification process mitigates downgrade attacks on cryptographic algorithms and prevents poisoning of log or witness files, since unauthorized changes fail signature verification. Verification does not, however, address availability risks; implementers **SHOULD** consider operational measures (e.g., [watchers](#did-watchers) and well-known web techniques) to improve resilience.

- **Misleading prior-domain association** — A DID may be ported from a domain it never actually used, creating a false impression of association with that domain. Mitigation: resolvers and clients **MUST** ignore prior domain components when evaluating the DID, as described in [Unique Assignment of DIDs](#unique-assignment-of-dids).

The use of DNSSEC [[spec:RFC4033]], [[spec:RFC4034]], [[spec:RFC4035]] is essential to prevent spoofing and ensure authenticity of DNS records.

### Residual Risks

Residual risks include:

- Compromise of the web hosting infrastructure serving the DID resources.
  - While this can impact access to the DID Log and associated files, it does not compromise the integrity of the log entries themselves, nor the verifiability of the DID.
- Compromise of controller private keys.
  - A `did:webvh` [[ref: DID Controller]] can mitigate this risk through the use of [pre-rotation keys](#pre-rotation-key-hash-generation-and-verification).
  - In doing so, [[ref: DID Controller]]'s **SHOULD** avoid reusing revealed pre‑rotation keys. While not invalid per this specification, re‑use of a pre‑rotation key after disclosure reduces compromise containment. Mitigation: follow the one‑time‑use best practice and securely destroy revealed private keys (see [Pre‑rotation Key Hash Generation and Verification](#pre-rotation-key-hash-generation-and-verification)). Resolvers are **NOT REQUIRED** to enforce this, but **MAY** warn.
  - Additional good security practices **SHOULD** also be followed, such as using hardware security modules (HSMs) or secure enclaves for key storage, enforcing strong access controls, maintaining secure backups of critical keys, and performing regular key rotations.
- Weaknesses in underlying cryptographic algorithms after deployment.
- Misconfiguration of cache control or TTL values.
- Implementation errors in DID resolvers or controllers.

### Integrity Protection and Update Authentication

All DID operations (create, update, deactivate) are integrity-protected by the cryptographic verification of DID Log entries. Update authentication is provided by verifying the [[ref: DID Controller]]'s proof(s) against the valid `updateKeys` in the DID [[ref: Parameters]].

Because a `did:webvh` DID document and its associated log entries are self-certifying, they can be verified and trusted regardless of how they are retrieved — whether directly from the host, via a cache, through a CDN, from a [DID Watcher](#did-watchers), or via a trusted resolver service. The verification process ensures authenticity and integrity independent of the transport channel.

### Authentication Characteristics

The authentication of DID updates is based on possession of the private keys associated with the update and pre-rotation keys. The security of the DID therefore depends on the strength of these keys, their secure storage, and the cryptographic algorithms used.

## Unique Assignment of DIDs

In `did:webvh`, uniqueness of a DID is based on the [[ref: self-certifying identifier]] (SCID) generated at the inception of the DID. The SCID is cryptographically bound to the DID Controller’s keys and ensures that no two independently created DIDs can have the same identifier.

The DNS portion of the DID is used solely for discovery of the DID Log and associated files; it is not used for verification of DID control. Further, the DNS name does not need to be owned or directly controlled by the DID Controller. For example, a DID can be published within a namespace provided by a hosting platform (e.g., a GitHub repository or pages site) that serves static files over HTTPS. In such cases, platform policies and HTTPS server authentication are relied upon for access and integrity at the transport layer, while DID verification is provided entirely by the SCID and verifiable history of the DID.

A `did:webvh` identifier may include a domain component that was never actually used to host its DID Log, before being moved — via the [did:webvh portability](#did-portability) capability — to a different domain under the [[ref: DID Controller]]’s control. This creates a potential for misleading claims of association with the original domain. To prevent this, resolvers and clients of resolvers **MUST** ignore any prior domain components when evaluating the history or trustworthiness of a `did:webvh` DID; only the current hosting location and its associated verifiable history are relevant. In addition, the [whois](#whois-linkedvp-service) DID URL capability **SHOULD** be used to obtain attestations about the DID and [[ref: DID Controller]] from relevant authorities.

## Endpoint Authentication

DID resource retrieval endpoints **MUST** be authenticated using TLS server authentication. Self-signed certificates **SHOULD NOT** be used in production. This requirement is not unique to the `did:webvh` method; it applies to all web traffic. While the verifiability of `did:webvh` ensures that any tampering with the contents of individual log entries is detectable, TLS provides additional protection against active network attacks (including truncation or withholding) and ensures the authenticity of the server providing the DID resources.

### Network Topology

Unlike DLT-based DID methods, `did:webvh` relies on web infrastructure and does not require peer-to-peer networking. However, implementations relying on CDN caching or load balancers **MUST** ensure these intermediaries do not serve stale or tampered DID data.

### Cryptographic Protection

The following data is protected:

- **DID Log entries** — Signed by the DID controller's keys.
- **Witness proofs** — Signed by witness nodes’ keys.

These signatures provide integrity and update authentication but not confidentiality; DID Log entries are public.

Secret data (e.g., controller private keys, witness private keys, random seeds) **MUST** be protected in secure storage and never exposed in the DID Log.

### Signature Implementation

`did:webvh` uses standard [[ref: Data Integrity]] proof mechanisms for signing DID Log entries and witness proofs, as defined in the cryptographic suite used. Implementations **MUST** follow the suite’s signature generation and verification requirements.

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

## Privacy Considerations

This section addresses the privacy considerations in alignment with [[spec:RFC6973]] Section 5 and the [[spec:DID-CORE]] requirements in [DID Core 7.4](https://www.w3.org/TR/did-core/#privacy-requirements).

## Surveillance

The `did:webvh` method publishes DID logs to publicly accessible HTTPS endpoints. While the contents of the DID Log are generally intended to be public, the timing, frequency, and correlation of updates can be observed and may reveal operational patterns or associations.

Resolution of a `did:webvh` identifier also exposes the resolver’s network activity to DNS providers and web servers, which could be used for tracking. Controllers and resolvers **MAY** use privacy-enhancing technologies such as VPNs, TOR, or trusted universal resolver services, and **MAY** adopt emerging approaches such as [Oblivious DNS over HTTPS (ODoH)](https://datatracker.ietf.org/doc/html/draft-pauly-dprive-oblivious-doh-03) to reduce this risk.

### Stored Data Compromise

DID data is stored on web servers. A compromise of the hosting infrastructure could allow tampering with DID resources. HTTPS and cryptographic signatures protect integrity, but confidentiality is not provided.

### Unsolicited Traffic

Publishing a DID Log does not inherently solicit inbound traffic beyond normal DID resolution. However, public exposure of service endpoints in the DID Document may increase unsolicited interactions. [[ref: DID Controllers]] SHOULD avoid publishing unnecessary endpoints.

## Misattribution

Because the DNS portion of the DID is used for discovery, a misattribution risk arises if that DNS name is reassigned without the associated DID resources being updated or removed. Controllers **SHOULD** ensure DID deactivation before relinquishing a DNS name or namespace.

Where possible, Controllers **SHOULD** use the [DID Portability](#did-portability) mechanism defined in this specification to move the DID to a new location under their control. When portability is used, an HTTP redirect from the old location to the new one is the preferred approach, even in cases where DID ownership is transferred, as it enables seamless resolution while preserving the DID’s verifiable history.

### Correlation

The use of a static DID and public DID Log entries can enable correlation of activities over time. Controllers SHOULD avoid embedding personal identifiers or unnecessary service endpoints in DID documents.

### Identification

DIDs are public identifiers and can be linked to real-world identities through their domain ownership. Entities that require anonymity SHOULD consider DID methods designed for pseudonymity.

### Secondary Use

Information published in the DID Log may be repurposed by third parties. Controllers SHOULD minimize the publication of data that could be used for purposes beyond the intended use.

### Disclosure

All data in the DID Log is publicly accessible. Sensitive data MUST NOT be included.

### Exclusion

`did:webvh` uses DNS for discovery, and while the DID Controller may control the web server on which a `did:webvh` DID is published, the DID Method does **not** require controller ownership of a DNS domain. Controllers **MAY** publish the DID Log and associated resources under a namespace they control on a web‑hosting platform that serves static files over HTTPS (for example, a GitHub repository or pages space). This reduces barriers to participation.

Residual exclusion risks remain: access to such platforms typically requires an account and compliance with provider terms of service; platforms might impose geoblocking, payment requirements, or content restrictions; and accounts can be suspended. Controllers **SHOULD** maintain the ability to republish or mirror DID resources under alternative hosts (including using `did:webvh` [Watchers](#did-watchers)) and **SHOULD** document a transition plan so that participants are not locked out if a hosting provider becomes unavailable. The verifiable history of the DID ensures that the DID can be verified regardless of the source of the [[ref: DID Log]] and related files.

### No Phone Home Mitigations

A privacy concern in decentralized identity ecosystems is the possibility of an issuer of identity information (such as Verifiable Credentials) being notified when and where individuals present those credentials. This “phone home” surveillance problem (such as described by [nophonehome.com](https://nophonehome.com)) can occur if the presentation of a credential requires contacting the issuer’s infrastructure, either directly or indirectly, in a way that can be linked to the credential holder. As `did:webvh` issuer DIDs may be self-hosted, this is particularly relevant.

While this concern is generally associated with the use of verifiable credentials rather than about the resolution of DIDs, a `did:webvh` server operated by an issuer might host related resources that are retrieved at credential presentation time — for example, revocation registries or status lists. If these resources are implemented in a way that enables linking access patterns to individual credential holders, the [[ref: DID Controller]] could use that information for surveillance.

Privacy-respecting credential issuers, credential holders, and verifiers all have a role in preventing “phone home” surveillance. The following practices can help:

- **Privacy-respecting Issuers (including DID Controllers hosting VC-related resources)**
  - **SHOULD NOT** design or deploy credential-related resources (such as revocation registries) in a way that enables the identification of individual holders at presentation time.
  - Use privacy-preserving designs — such as compact status lists, batching, and/or large revocation registries that provide “lost in a crowd” anonymity — to prevent correlation of access patterns to specific credential holders.
  - Use HTTP caching headers (e.g., `Cache-Control`, `ETag`) to enable CDNs, browsers, and resolvers to cache DID resources efficiently, reducing repeated origin requests that could enable tracking and improving performance.

- **Holders**
  - Use privacy-preserving techniques such as using [DID Watchers](#did-watchers), trusted intermediaries, or privacy-enhancing network tools (e.g., TOR, VPN) to retrieve revocation status data without revealing the holder's location or identity to the issuer.
  - Separate in time interactions with the issuer (e.g., retrieving revocation status) from credential presentations to verifiers, and structure retrievals to avoid creating identifiable access patterns that could enable correlation or surveillance.

- **Verifiers**
  - Be flexible in the timeliness of credential status checks, and consider omitting them entirely when risk is low, reducing or eliminating the need for the retrieval of status data.
  - Separate the retrieval of status or issuer data from the verification process by caching issuer-provided information where possible, so holders are not required to contact the issuer in real time.
  - Use privacy-enhancing network tools (e.g., TOR, VPN) or trusted intermediary resolvers to retrieve DID resources in a way that avoids revealing verifier identity or network location to the issuer or hosting provider.
  - Where possible, support privacy-preserving resolution protocols or intermediaries offered by the hosting party.

A related risk is that an issuer may deliberately or inadvertently create **holder-specific identifiers** for data elements that are expected to be common across all holders — for example, by issuing personalized revocation list URLs or unique resource paths. This enables tracking of specific holders even if the underlying credential is otherwise privacy-preserving. Preventing this requires shared responsibility: issuers **MUST NOT** generate such holder-specific identifiers; holders and verifiers **SHOULD** reject credentials or status mechanisms that contain them; and independent third parties, including [DID Watchers](#did-watchers), **SHOULD** monitor issuer implementations to detect and report violations of this principle.

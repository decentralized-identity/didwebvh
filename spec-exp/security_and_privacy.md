## Security Considerations

*This section is non-normative.*

This section follows the guidelines in [[spec:RFC3552]] and aligns with the
[[spec:DID-CORE]] requirements in [DID Core
7.3](https://www.w3.org/TR/did-core/#security-requirements). The security
considerations in [VH-Log's Security
Considerations](https://swcurran.github.io/VH-Log/next/index.html#security-considerations)
section apply to `did:webvh` unchanged — including those for eavesdropping,
replay, truncation, denial of service, split views, server-side request
forgery, residual risks, and implementation hygiene. The sections below cover
only what is specific to `did:webvh`. The requirements referred to here are
defined in the normative sections of this specification and of VH-Log.

### DNS and the Web Location

A `did:webvh` DID contains the domain name of the web location where its
[[ref: DID Log]] is published. The domain is used only to find the
[[ref: DID Log]]: the [[ref: SCID]], the hash chain and the proofs verify it,
so an attacker who controls DNS or the web server cannot alter the history
without detection (see VH-Log's [Unique Assignment of
Logs](https://swcurran.github.io/VH-Log/next/index.html#unique-assignment-of-logs)).
Control of the domain does, however, determine which copy of the
[[ref: DID Log]] a [[ref: Resolver]] finds there:

- **Withholding and truncation.** An attacker who controls DNS or the web
  server can serve an older copy of the log, for example one from before a
  key rotation or deactivation, or serve nothing at all. DNSSEC
  [[spec:RFC4033]] [[spec:RFC4034]] [[spec:RFC4035]] helps prevent DNS
  spoofing. A client can detect a stale copy by asking the
  [[ref: Resolver]] to check the [[ref: DID Log]] against [[ref: watchers]],
  with the `checkWatchers`, `extraWatchers` and `minCopies` [resolution
  options](#didwebvh-resolution-options).
- **A second factor for updates.** To publish a new version of the DID, an
  attacker who has stolen the update keys also needs to control the web
  location. [[ref: Pre-rotation]] and [[ref: witnesses]] add further
  protection against a compromise of both.
- **Hosting platforms.** The [[ref: DID Controller]] need not own the domain
  in the DID. A DID can be published in a namespace provided by a hosting
  platform (e.g., a GitHub repository or pages site) that serves static files
  over HTTPS. Platform policies and HTTPS server authentication then protect
  access to the location, while verification of the DID depends only on the
  [[ref: SCID]] and the verifiable history.

### Misleading Prior-Domain Association

With [[ref: DID portability]], a `did:webvh` DID can be created with a domain
component that was never used to host its [[ref: DID Log]], and then moved to a
domain under the [[ref: DID Controller]]'s control. The DID's history then
appears to associate it with the first domain. For this reason,
[[ref: Resolvers]] and their clients ignore prior domain components when
evaluating a `did:webvh` DID, as required in [DID
Portability](#did-portability). The [`/whois`](#the-whois-service) DID URL can
be used to obtain attestations about the DID and its [[ref: DID Controller]]
from relevant authorities.

### International Domain Names

`did:webvh` DIDs can use international domain names. Different encodings of
the same name could otherwise be used to make two DIDs look alike, or to evade
checks on the domain. The [DID-to-HTTPS
Transformation](#the-did-to-https-transformation) requires IDNA2008 processing
and validation of the domain before any request is made, and the
[Method-Specific Identifier](#method-specific-identifier) rules require
percent-encoding to be decoded exactly once.

### Publishing Parallel `did:web`

A resolver that uses the [parallel `did:web`](#publishing-a-parallel-didweb-did)
DID gets the [[ref: DIDDoc]] without the verifiable history, and so without
the security properties that `did:webvh` adds. [[ref: DID Controllers]] that
publish a parallel `did:web` are advised to weigh that loss, and to refer to
the [did:web Security and Privacy
Considerations](https://w3c-ccg.github.io/did-method-web/#dns-considerations).

### Post Quantum Attacks

As described in [VH-Log's Post Quantum
Attacks](https://swcurran.github.io/VH-Log/next/index.html#post-quantum-attacks)
section. For further guidance, see the [corresponding Implementation Guide
section](https://didwebvh.info/latest/implementers-guide/prerotation-keys/#post-quantum-attacks).

### Resolver Validation Checklist

This checklist extends [VH-Log's Resolver Validation
Checklist](https://swcurran.github.io/VH-Log/next/index.html#resolver-validation-checklist)
with `did:webvh`-specific points. It does not restate or replace the normative
requirements.

- **DID syntax:** the `did` input conforms to DID Core and the `did:webvh`
  ABNF; the domain, after percent-decoding once and IDNA processing, is a
  fully qualified domain name, not an IP address; any port is in the range
  1–65535; path segments are valid after decoding (`.`, `..`, `/`, `\`, NUL,
  leading/trailing whitespace).
- **Resolution options:** at most one version option; malformed options
  return `invalidOptions`; unsupported `versionNumber`, `checkWatchers`,
  `extraWatchers` or `minCopies` return `featureNotSupported`;
  `extraWatchers` values are `https` URLs.
- **Parameters:** `method` is an acceptable `did:webvh` value; `logVersion`
  is absent; `portable: true` only in the first entry, and never restored
  after being set to `false`.
- **SCID and identity:** every entry's `state.id` parses as a `did:webvh` DID
  whose [[ref: SCID]] equals the first entry's `parameters.scid` and the
  [[ref: SCID]] in the DID being resolved; `state.id` changes only under
  portability; the DID being resolved matches at least one entry's
  `state.id`.
- **Witnesses:** as defined in [DID Witnesses](#did-witnesses) — `did:key`
  witness identifiers validated when the `witness` parameter is validated;
  keys recovered only from the `did:key` body; body and fragment multibase
  values equal.

## Privacy Considerations

*This section is non-normative.*

This section addresses the privacy considerations in alignment with
[[spec:RFC6973]] Section 5, and aligns with the [[spec:DID-CORE]] requirements
in [DID Core 7.4](https://www.w3.org/TR/did-core/#privacy-requirements). The
privacy considerations in [VH-Log's Privacy
Considerations](https://swcurran.github.io/VH-Log/next/index.html#privacy-considerations)
section apply to `did:webvh` unchanged, except as noted below.

### Surveillance

Resolving a `did:webvh` DID exposes the [[ref: Resolver]]'s interest in the
DID to DNS providers and to the web server at the DID's location. The
[Resolution Algorithm](#resolution-algorithm) recommends DNS over HTTPS
[[spec:rfc8484]]. [[ref: Resolvers]] can also retrieve the [[ref: DID Log]]
from a [[ref: watcher]], or use privacy-enhancing technologies such as VPNs,
Tor, trusted universal resolver services, or [Oblivious DNS over HTTPS
(ODoH)](https://datatracker.ietf.org/doc/html/draft-pauly-dprive-oblivious-doh-03).

### Unsolicited Traffic

Publishing a [[ref: DID Log]] does not inherently solicit inbound traffic
beyond normal DID resolution. However, public exposure of service endpoints in
the [[ref: DIDDoc]] may increase unsolicited interactions, so
[[ref: DID Controllers]] are advised not to publish unnecessary endpoints.

### Misattribution

Because the domain name in the DID is used to find the [[ref: DID Log]], a
later holder of the domain name could publish resources at the DID's location
and be mistaken for the [[ref: DID Controller]]. The [Deactivate
(Revoke)](#deactivate-revoke) section asks [[ref: DID Controllers]] to
deactivate or move a DID before giving up control of the domain. When a DID is
moved using [DID Portability](#did-portability), an HTTP redirect from the old
location to the new one lets clients still holding the old DID find the
[[ref: DID Log]], even when control of the DID is transferred.

### Identification

`did:webvh` DIDs are public identifiers, and the domain name in the DID can
link them to real-world identities. Entities that require anonymity are
advised to consider DID methods designed for pseudonymity.

### No Phone Home Mitigations

A privacy concern in decentralized identity ecosystems is the possibility of an
issuer of identity information (such as Verifiable Credentials) being notified
when and where individuals present those credentials. This "phone home"
surveillance problem (such as described by
[nophonehome.com](https://nophonehome.com)) can occur if the presentation of a
credential requires contacting the issuer's infrastructure, either directly or
indirectly, in a way that can be linked to the credential holder. As
`did:webvh` issuer DIDs may be self-hosted, this is particularly relevant.

While this concern is generally associated with the use of verifiable
credentials rather than the resolution of DIDs, a `did:webvh` server operated
by an issuer might host related resources — for example, revocation registries
or status lists published through the [`#files` service](#the-files-service)
— that are retrieved at credential presentation time. If these resources are
implemented in a way that enables linking access patterns to individual
credential holders, the [[ref: DID Controller]] could use that information for
surveillance.

Privacy-respecting credential issuers, credential holders, and verifiers all
have a role in preventing "phone home" surveillance. The following practices
can help:

- **Privacy-respecting Issuers (including DID Controllers hosting VC-related resources)**
  - Avoid designing or deploying credential-related resources (such as
    revocation registries) in a way that enables the identification of
    individual holders at presentation time.
  - Use privacy-preserving designs — such as compact status lists, batching,
    and/or large revocation registries that provide "lost in a crowd"
    anonymity — to prevent correlation of access patterns to specific
    credential holders.
  - Use HTTP caching headers (e.g., `Cache-Control`, `ETag`) to enable CDNs,
    browsers, and resolvers to cache DID resources efficiently, reducing
    repeated origin requests that could enable tracking and improving
    performance.

- **Holders**
  - Use privacy-preserving techniques such as using [[ref: watchers]],
    trusted intermediaries, or privacy-enhancing network tools (e.g., Tor,
    VPN) to retrieve revocation status data without revealing the holder's
    location or identity to the issuer.
  - Separate in time interactions with the issuer (e.g., retrieving
    revocation status) from credential presentations to verifiers, and
    structure retrievals to avoid creating identifiable access patterns that
    could enable correlation or surveillance.

- **Verifiers**
  - Be flexible in the timeliness of credential status checks, and consider
    omitting them entirely when risk is low, reducing or eliminating the need
    for the retrieval of status data.
  - Separate the retrieval of status or issuer data from the verification
    process by caching issuer-provided information where possible, so holders
    are not required to contact the issuer in real time.
  - Use privacy-enhancing network tools (e.g., Tor, VPN) or trusted
    intermediary resolvers to retrieve DID resources in a way that avoids
    revealing verifier identity or network location to the issuer or hosting
    provider.
  - Where possible, support privacy-preserving resolution protocols or
    intermediaries offered by the hosting party.

A related risk is that an issuer may deliberately or inadvertently create
**holder-specific identifiers** for data elements that are expected to be
common across all holders — for example, by issuing personalized revocation
list URLs or unique resource paths. This enables tracking of specific holders
even if the underlying credential is otherwise privacy-preserving. Preventing
this is a shared responsibility: issuers are advised never to generate such
holder-specific identifiers; holders and verifiers are advised to reject
credentials or status mechanisms that contain them; and independent third
parties, including [[ref: watchers]], can monitor issuer implementations to
detect and report violations of this principle.

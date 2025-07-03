## Abstract

DID Web + Verifiable History (`did:webvh`) is an enhancement to the [[ref: did:web]] DID method,
providing complementary features that address `did:web`'s
limitations as a long-lasting DID. `did:webvh` features include:

- The same DID-to-HTTPS transformation as `did:web`.
- Ongoing publishing of the full history of the DID, including all of the DID
  Document ([[ref: DIDDoc]]) versions instead of, or alongside an existing
  `did:web` DIDDoc.
- The ability to resolve the full history of the DID using a verifiable chain of
  updates to the [[ref: DIDDoc]] from genesis to deactivation.
- A [[ref: self-certifying identifier]] (SCID) for the DID. The [[ref: SCID]], globally unique and
  embedded in the DID, is derived from the initial [[ref: DID log entry]]. It ensures the integrity
  of the DID's history mitigating the risk of attackers creating a new object with
  the same identifier.
- An optional mechanism for enabling [[ref: DID portability]] via the [[ref: SCID]], allowing
  the DID's web location to be moved and the DID string to be updated, both while retaining
  a connection to the predecessor DID(s) and preserving the DID's verifiable history.
- [[ref: DIDDoc]] updates contain a proof signed by the [[ref: DID Controller's]] *authorized* to
  update the DID.
- An optional mechanism for publishing "pre-rotation" keys to prevent the loss of
  control of a DID in cases where an active private key is compromised.
- An optional mechanism for having collaborating [[ref: witnesses]]
  that approve of updates to the DID by a [[ref: DID Controller]] before publication.
- Support for cryptographic agility through versioned specification upgrades,
  algorithm-identifying formats (e.g., [[ref: multihash]] and [[ref: Data Integrity]] proofs), and
  per-entry method parameters in the [[ref: DID log]] that enable DIDs to evolve
  cryptographically over time.
- An optional mechanism for publishing the location of `did:webvh` [[ref:
  watchers]] in the [[ref: DID log]] that resolvers can use as another
  source DID data for long term resolution or detection of malicious [[ref: DID Controllers]].
- DID URL path handling that defaults (but can be overridden) to automatically
  resolving `<did>/path/to/file` by using a comparable DID-to-HTTPS translation
  as for the [[ref: DIDDoc]].
- A DID URL path `<did>/whois` that defaults to automatically returning (if
  published by the [[ref: DID controller]]) a [[ref: Verifiable Presentation]]
  containing [[ref: Verifiable Credentials]] with the DID as the
  `credentialSubject`, signed by the DID. It draws inspiration from the
  traditional WHOIS protocol [[spec:rfc3912]], offering an easy-to-use,
  decentralized, trust registry.

Combined, the additional features enable greater trust, security and verifiability without
compromising the simplicity of `did:web`.

For information beyond this specification about the (`did:webvh`) DID method and how (and
where) it is used in practice, please visit
[https://didwebvh.info/](https://didwebvh.info/)

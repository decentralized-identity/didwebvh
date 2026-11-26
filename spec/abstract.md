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
- An optional mechanism for publishing the location of `did:webvh` [[ref: watchers]] in the [[ref: DID log]] that resolvers can use as another
  source of DID data for long term resolution or detection of malicious [[ref: DID Controllers]].
- DID URL path handling (such as `<did>/path/to/file` and `<did>/whois`)
  through services that the [[ref: DID Controller]] declares in the
  [[ref: DIDDoc]].

Combined, the additional features enable greater trust, security and verifiability without
compromising the simplicity of `did:web`.

A companion DID method, `did:vh` (DID + Verifiable History), is derived from
`did:webvh` and is specified in [The `did:vh` DID
Method](https://identity.foundation/didvh/). It uses the same
[[ref: DID Log]], [[ref: SCID]], key authorization, [[ref: pre-rotation]],
[[ref: witnesses]] and [[ref: watchers]] as `did:webvh`. However, a `did:vh`
DID contains no domain name or path, so it is not bound to the location where
its [[ref: DID Log]] is published. `did:vh` suits DIDs that are not tied to a
web location. `did:webvh` remains the choice where resolution from the DID
alone, through the DID-to-HTTPS transformation, is wanted.

For information beyond this specification about the (`did:webvh`) DID method and how (and
where) it is used in practice, please visit
[https://didwebvh.info/](https://didwebvh.info/)

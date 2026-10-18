## Abstract

DID Web + Verifiable History (`did:webvh`) is an enhancement to the
[[ref: did:web]] DID method, providing complementary features that address
`did:web`'s limitations as a long-lasting DID.

This experimental version defines `did:webvh` as a [[ref: specialisation]] of
the [[ref: VH-Log]] specification [[spec:VH-LOG]]. VH-Log was extracted from `did:webvh` v1.0,
and defines the verifiable history mechanism — the log, its cryptographic
chaining and verification, [[ref: witnesses]] and [[ref: watchers]] — for any
kind of versioned [[ref: state]] object. `did:webvh` constrains VH-Log by
specifying:

- The [[ref: state]] object is a W3C DID Document ([[ref: DIDDoc]]).
- The DID is `did:webvh:<SCID>:<domain>[:<path>]`, and the [[ref: DID Log]]
  is located with the same DID-to-HTTPS transformation as `did:web`.
- The log file is named `did.jsonl`, and the witness proofs file
  `did-witness.json`.
- The `method` [[ref: parameter]] (`did:webvh:1.0`) is the version
  parameter, and [[ref: witnesses]] are identified by [[ref: did:key]] DIDs.

Through VH-Log, `did:webvh` provides:

- A [[ref: self-certifying identifier]] (SCID), globally unique and embedded
  in the DID, derived from the initial [[ref: DID log entry]]. It ensures the
  integrity of the DID's history, mitigating the risk of attackers creating a
  new object with the same identifier.
- The ability to resolve the full history of the DID using a verifiable chain
  of updates to the [[ref: DIDDoc]], from creation to deactivation.
- [[ref: DIDDoc]] updates containing a proof signed by a
  [[ref: DID Controller]]-authorized key.
- An optional mechanism for publishing pre-rotation key hashes to prevent the
  loss of control of a DID when an active private key is compromised.
- An optional mechanism for having collaborating [[ref: witnesses]] approve
  updates to the DID before publication.
- Support for cryptographic agility through versioned specification upgrades
  and algorithm-identifying formats.
- An optional mechanism for listing [[ref: watchers]] that archive and
  re-serve the DID's history, and resolution options that check the
  [[ref: DID Log]] against [[ref: watchers]].

To these, `did:webvh` adds features that depend on the DID's web location:

- The same DID-to-HTTPS transformation as `did:web`, and the option of
  publishing a parallel `did:web` DID.
- An optional mechanism for enabling [[ref: DID portability]], allowing the
  DID's web location to be moved and the DID string to be updated, while
  retaining the [[ref: SCID]] and verifiable history.
- DID URL path handling that defaults (but can be overridden) to
  dereferencing `<did>/path/to/file` using a comparable DID-to-HTTPS
  transformation as for the [[ref: DIDDoc]].
- A DID URL path `<did>/whois` that defaults to returning (if published by the
  [[ref: DID controller]]) a [[ref: Verifiable Presentation]] containing
  [[ref: Verifiable Credentials]] with the DID as the `credentialSubject`,
  signed by the DID. It draws inspiration from the traditional WHOIS protocol
  [[spec:rfc3912]], offering an easy-to-use, decentralized trust registry.

Combined, these features enable greater trust, security and verifiability
without compromising the simplicity of `did:web`.

For information beyond this specification about the `did:webvh` DID method and
how (and where) it is used in practice, please visit
[https://didwebvh.info/](https://didwebvh.info/).

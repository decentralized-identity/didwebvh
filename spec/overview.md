## Overview

The emergence of [[ref: Decentralized Identifiers]] (DIDs) and with them the
evolution of [[ref: DID Methods]] continues to be a dynamic area of
development in the quest for trusted, secure and private digital identity
management where the users are in control of their own data.

The `did:web` method, for example, leverages the Domain Name System (DNS) to
perform the DID operations. This approach is praised for its simplicity and
ease of deployment, including DID-to-HTTPS transformation and addressing
some aspects of trust by allowing for DIDs to be associated with a domain's
reputation or published on platforms such as GitHub. However, it is not
without its challenges--
from trust layers inherited from the web and the absence of a verifiable
history for the DID.

Tackling these concerns, the `did:webvh` (`did:web` + Verifiable History) DID
Method aims to enhance `did:web` by introducing features such as a [[ref: self-certifying identifier]] (SCID), update key(s) and a verifiable history,
akin to what is available with ledger-based DIDs, but without relying on a
ledger.

This approach not only maintains backward compatibility but also offers an
additional layer of assurance for those requiring more robust verification
processes. By publishing the resulting DID as both `did:web` and `did:webvh`, it
caters to a broader range of trust requirements, from those who are comfortable
with the existing `did:web` infrastructure to those seeking greater security
assurances provided by `did:webvh`. This innovative step represents a significant
stride towards a more trusted and secure web, where the integrity of
cryptographic key publishing is paramount.

The key differences between `did:web` and `did:webvh` revolve around the core
issues of decentralization and security. `did:web` is recognized for its
simplicity and cost-effectiveness, allowing for easy establishment of a
credential ecosystem. However, it is not inherently decentralized as it relies
on DNS domain names, which require centralized registries. Furthermore, it lacks a
cryptographically verifiable, tamper-resistant, and persistently stored DID
document. In contrast, `did:webvh` is an enhancement
to `did:web`, aiming to address these limitations by adding a verifiable history
to the DID without the need for a ledger. This method provides a more
decentralized approach by ensuring that the security of the embedded
SCID does not depend on DNS. `did:webvh` is
capable of dereferencing a cryptographically verifiable trust registry and status
lists, using DID-Linked Resources, which `did:web` lacks. These features are
designed to build a trusted web by offering a higher level of assurance for
cryptographic key publishing and management.

For backwards compatibility, and for verifiers that "trust" `did:web`, a
`did:webvh` can be trivially modified and published with a parallel `did:web`
DID. For resolvers that want more assurance, `did:webvh` provides a way to
verify a did:web using the features listed in the [Abstract](#abstract).

The following is a `tl;dr` summary of how `did:webvh` works:

1. `did:webvh` uses the same DID-to-HTTPS transformation as `did:web`, so
   `did:webvh`'s  `did.jsonl` ([[ref: JSON Lines]]) file is found in the same
   location as `did:web`'s `did.json` file, and supports an easy transition
   from `did:web` to gain the added benefits of `did:webvh`.
2. The `did.jsonl` is a list of JSON [[ref: DID log entries]], one per line,
   whitespace removed (per [[ref: JSON Lines]]). Each entry contains the
   information needed to derive a version of the [[ref: DIDDoc]] from its preceding
   version. The `did.jsonl` is also referred to as the [[ref: DID Log]].
3. Each [[ref: DID log entry]] is a JSON object containing the following properties:
    1. `versionId` -- a value that combines the version number
       (starting at `1` and incremented by one per version), a literal dash
       `-`, and a hash of the entry. The [[ref: entry hash]] calculation links each entry
       to its predecessor in a ledger-like chain.
    2. `versionTime` -- as asserted by the [[ref: DID Controller]].
    3. `parameters` -- a set of [[ref: parameters]] that impact the processing of the current and
      future [[ref: log entries]].
        - Example [[ref: parameters]] are the version of the `did:webvh` specification
        being used, the [[ref: SCID]], the keys that sign the
        first entry, and the hashes of the [[ref: pre-rotation]] keys that can
        sign the next entry.
    4. `state` -- the new version of the [[ref: DIDDoc]].
    5. A [[ref: Data Integrity]] (DI) proof across the entry, signed by a [[ref: DID Controller]]-authorized key to update the [[ref: DIDDoc]].
    6. If the [[ref: DID Controller]] enables support for DID [[ref: witnesses]], an
       extra file (`did-witness.json`) in the same web location contains [[ref: Data Integrity]] proofs from witnesses for [[ref: DID Log entries]].
4. In generating the first version of the [[ref: DIDDoc]], the [[ref: DID Controller]] calculates the [[ref: SCID]] for the DID from the first [[ref: log entry]] (which includes the [[ref: DIDDoc]]). This is done by using the
  string `"{SCID}"` everywhere the actual [[ref: SCID]] is to be placed in order
  to generate the hash. The [[ref: DID Controller]] then replaces the
  placeholders with the calculated [[ref: SCID]], including it as a `parameter`
  in the first [[ref: log entry]], and inserting it where needed in the initial
  (and all subsequent) DIDDocs. The [[ref: SCID]] must be verified by the
  resolvers, to verify that the inception event has not been tampered with. The
  [[ref: SCID]] also enables an optional [[ref: portability]] capability,
  allowing a DID's web location to be moved, while retaining the [[ref: SCID]] and verifiable
  history of the identifier.
5. A [[ref: DID Controller]] generates and publishes the new/updated [[ref: DID Log]] file by making it available at the appropriate location on the web,
  based on the DID's identifier. If a `did:webvh` has [[ref: watchers]], a
  webhook is triggered to notify the [[ref: watchers]] that an update is
  available and should be retrieved.
6. Given a `did:webvh` DID, a resolver converts the DID to an HTTPS URL,
  retrieves, and processes the [[ref: DID Log]] `did.jsonl` file, generating and verifying
  each [[ref: log entry]] as per the requirements outlined in this specification.
    - In the process, the resolver collects all the [[ref: DIDDoc]] versions and public
      keys used by the DID currently, and in the past. This enables
      resolving both current and past versions of the DID and keys.
7. `did:webvh` DID URLs with paths, such as `<did>/whois`, are dereferenced
  to resources published by the [[ref: DID Controller]], using services the
  [[ref: DID Controller]] includes in the [[ref: DIDDoc]]. See [Common DID URL
  Path Services](#common-did-url-path-services).
8. A [[ref: DID Controller]] can easily generate and publish a `did:web` DIDDoc
  from the latest `did:webvh` [[ref: DIDDoc]] in parallel with the `did:webvh` [[ref: DID Log]].

  ::: warning
    A resolver settling for just the `did:web` version of the DID does not get the
    verifiability of the `did:webvh` log.
  :::

An example of a `did:webvh` evolving through a series of versions can be seen in
the [`did:webvh` Examples](https://didwebvh.info/latest/example/) on the `did:webvh`
information site.

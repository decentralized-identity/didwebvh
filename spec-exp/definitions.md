## Definitions

[[def: VH-Log, Verifiable History Log, VH Log]]

~ The Verifiable History Log specification defines a general-purpose,
append-only, cryptographically chained log structure for recording the
verifiable history of a versioned [[ref: state]] object. This version of
`did:webvh` is a [[ref: specialisation]] of VH-Log. See the [VH-Log
specification](https://swcurran.github.io/VH-Log/next/index.html).

[[def: specialisation, specialisations]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:specialisation):
a specification that uses [[ref: VH-Log]] as its foundation. `did:webvh` is a
[[ref: specialisation]] of [[ref: VH-Log]] in which the [[ref: state]] is a
W3C DID Document ([[ref: DIDDoc]]) and the log is located from the DID.

[[def: state]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:state): the
versioned object recorded in each log entry. In `did:webvh`, the
[[ref: state]] is the [[ref: DIDDoc]] for that version of the DID.

[[def: Data Integrity]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:data-integrity):
the W3C specification of mechanisms for ensuring the authenticity and
integrity of structured digital documents using digital signatures and other
cryptographic proofs.

[[def: Decentralized Identifier, Decentralized Identifiers, DID, DIDs]]

~ Decentralized Identifiers (DIDs) [[spec:did-core]] are a type of identifier
that enable verifiable, decentralized digital identities. A DID refers to any
subject (e.g., a person, organization, thing, data model, abstract entity,
etc.) as determined by the controller of the DID.

[[def: DID Controller, DID Controller's, DID Controllers]]

~ The entity that controls (creates, updates, deactivates) a given DID, as
defined in [[spec:DID-CORE]]. In VH-Log terms, the Log Controller.

[[def: DIDDoc]]

~ A DID Document as defined by [[spec:DID-CORE]] — the document returned when a
DID is resolved.

[[def: DID Log, DID Logs]]

~ The [[ref: VH-Log]] log for a `did:webvh` DID, published as `did.jsonl`: a
list of [[ref: DID log entries]], one added for each update of the DID.

[[def: DID Log Entry, DID Log Entries, Log Entries, Log Entry]]

~ A JSON object in a [[ref: DID Log]] that defines an authorized version of
the [[ref: DIDDoc]] and the [[ref: parameters]] in effect. The first entry
establishes the DID and version 1 of the [[ref: DIDDoc]].

[[def: DID Method, DID Methods]]

~ The mechanism by which a particular type of DID and its associated DID
document are created, resolved, updated, and deactivated, defined in a DID
method specification. This document is the DID method specification for
`did:webvh`.

[[def: DID Portability, did:webvh portability, `did:webvh` portability, portability]]

~ `did:webvh` portability is the capability to change the DID string for the
DID while retaining the [[ref: SCID]] and the history of the DID. This is useful
when forced to change (such as when an organization is acquired by another,
resulting in a change of domain names) and when changing DID hosting service
providers. See [DID Portability](#did-portability).

[[def: DID Resources, DID Resource]]

~ An object (often a file) referenced by a DID URL with a path, such as a
configuration file, schema, credential definition, logo, image or other data
linked to the DID. See [DID URL Path Handling](#did-url-path-handling).

[[def: did:web]]

~ `did:web` as described in the [W3C CCG
specification](https://w3c-ccg.github.io/did-method-web/) is a DID method that
leverages the Domain Name System (DNS) to perform the DID operations. It is
valued for its simplicity and ease of deployment compared to
[[ref: DID methods]] that are based on distributed ledgers or blockchain
technology, but also comes with increased challenges related to trust,
security and verifiability. `did:web` provides a starting point for
`did:webvh`, which complements `did:web` with specific features to address its
challenges while still providing ease of deployment.

[[def: did:key]]

~ `did:key`, as described in the [W3C CCG
specification](https://w3c-ccg.github.io/did-key-spec/), is a DID method that
derives a DID document directly from a single encoded public key, requiring no
registry or network interaction to resolve. `did:webvh` uses `did:key` DIDs to
identify [[ref: witnesses]].

[[def: Entry Hash, entryHash, entry hashes]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:entry-hash): a
hash over a [[ref: DID log entry]] (excluding its proof) that chains the entry
to its predecessor, and is included in the entry's `versionId`.

[[def: ISO8601, ISO8601 String]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:iso8601): a
date/time expressed using the [ISO8601
Standard](https://en.wikipedia.org/wiki/ISO_8601).

[[def: JSON Lines, JSON Line]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:json-lines):
lines of JSON with whitespace removed, separated by newlines, as described at
[https://jsonlines.org/](https://jsonlines.org/).

[[def: Linked-VP, Linked Verifiable Presentation]]

~ A [[ref: Verifiable Presentation]] about a DID subject, discoverable via a
`service` entry in the subject's [[ref: DIDDoc]], as described by the
[Decentralized Identity Foundation](https://identity.foundation/)'s [Linked VP
Specification](https://identity.foundation/linked-vp/). `did:webvh` locates
its Linked-VP via the [`#whois` Service](#the-whois-service).

[[def: parameters, parameter]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:parameters):
the configuration in each [[ref: DID log entry]] that controls how the
[[ref: DID Controller]] generates entries and how [[ref: Resolvers]] process
the [[ref: DID Log]].

[[def: Pre-Rotation, Key Pre-Rotation]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:pre-rotation):
a technique by which the controller of a key commits to the key it will rotate
to next, without revealing it, protecting against an attacker who learns the
current private key.

[[def: Resolver, Resolvers]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:resolver): a
party that retrieves and verifies a [[ref: DID Log]] to produce the current or
a historical [[ref: DIDDoc]]. For `did:webvh`, a DID resolver as defined in
[[spec:DID-RESOLUTION]].

[[def: self-certifying identifier, self-certifying identifiers, SCID, SCIDs]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:self-certifying-identifier):
an identifier derived from the hash of the first [[ref: DID log entry]],
generated with the placeholder `{SCID}` wherever the SCID is to appear. A
`did:webvh` DID begins with `did:webvh:` followed by its SCID.

[[def: Verifiable Credential, Verifiable Credentials]]

~ A verifiable credential can represent all of the same information that a
physical credential represents, adding technologies such as digital
signatures, to make the credentials more tamper-evident and so more
trustworthy than their physical counterparts. The [Verifiable Credential Data
Model](https://www.w3.org/TR/vc-data-model/) is a W3C Standard.

[[def: Verifiable Presentation, Verifiable Presentations]]

~ A [[ref: verifiable presentation]] data model is part of W3C's [Verifiable
Credential Data Model](https://www.w3.org/TR/vc-data-model/) that contains a
set of [[ref: verifiable credentials]] about a `credentialSubject`, and a
signature across the verifiable credentials generated by that subject. In this
specification, the use case of primary interest is where the DID is the
`credentialSubject` and the DID signs the [[ref: verifiable presentation]].

[[def: watcher, watchers]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:watcher): a
party that retrieves, verifies, archives and re-serves [[ref: DID Logs]],
indexed by [[ref: SCID]]. See [DID Watchers](#did-watchers).

[[def: witness, witnesses, witnessed]]

~ As defined in
[VH-Log](https://swcurran.github.io/VH-Log/next/index.html#term:witness): a
party that verifies a [[ref: DID log entry]] before it is published and, if it
approves, returns a [[ref: Data Integrity]] proof. `did:webvh` witnesses are
identified by [[ref: did:key]] DIDs. See [DID Witnesses](#did-witnesses).

[[def: W3C VCDM]]

~ A Verifiable Credential that uses the Data Model defined by the W3C
[[spec:vc-data-model]] specification.

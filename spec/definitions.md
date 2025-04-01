## Definitions

[[def: base58btc]]

~ Applies [[spec:draft-msporny-base58-03]] to convert
data to a `base58` encoding. Used in `did:webvh` for encoding hashes for [[ref: SCIDs]] and [[ref: entry hashes]].

[[def: Data Integrity]]

~ [W3C Data
Integrity](https://www.w3.org/community/reports/credentials/CG-FINAL-data-integrity-20220722/)
is a specification of mechanisms for ensuring the authenticity and integrity of
structured digital documents using cryptography, such as digital signatures and
other digital mathematical proofs.

[[def: Decentralized Identifier, Decentralized Identifiers, DID, DIDs]]

~ Decentralized Identifiers (DIDs) [[spec:did-core]] are a type of identifier that enable
verifiable, decentralized digital identities. A DID refers to any subject (e.g.,
a person, organization, thing, data model, abstract entity, etc.) as determined
by the controller of the DID.

[[def: DID Controller, DID Controller's, DID Controllers]]

~ The entity that controls (create, updates, deletes) a given DID, as defined
in the [[spec:DID-CORE]].

[[def: DIDDoc]]

~ A DID Document as defined by the [[spec: DID-Core]] -- the document returned when a DID is resolved.

[[def: DID Log, DID Logs]]

~ A DID Log is a list of [[ref: Entries]], with an entry added for each update of the DID,
including new versions of the [[ref: DIDDoc]] or changed information necessary to generate or validate the DID.

[[def: DID Log Entry, DID Log Entries, Entries, Log Entries, Log Entry]]

~ A DID Log Entry is a JSON object that defines the authorized
transformation of a [[ref: DIDDoc]] from one version to the next. The initial entry
establishes the DID and version 1 of the [[ref: DIDDoc]]. All entries are stored
in the [[ref: DID Log]].

[[def: DID Method, DID Methods]]

~ DID methods are the mechanism by which a particular type of DID and its
associated DID document are created, resolved, updated, and deactivated. DID
methods are defined using separate DID method specifications. This document is
the DID Method Specification for `did:webvh`.

[[def: DID Portability, did:webvh portability, `did:webvh` portability, portability]]

~ `did:webvh` portability is the capability to change the DID string for the
DID while retaining the [[ref: SCID]] and the history of the DID. This is useful
when forced to change (such as when an organization is acquired by another,
resulting in a change of domain names) and when changing DID hosting service
providers.

[[def: DID Resources, DID Resource]]

~ A DID Resource is an object (often a file) that is referenced by a DID URL, with a path to the resource. The DID URL allows resolvers to locate and retrieve specific content associated with a DID. Examples include configuration files, schemas, credential definitions, or other structured data linked to the DID.

[[def: did:web]]

~ `did:web` as described in the [W3C specification](https://w3c-ccg.github.io/did-method-web/)
is a DID method that leverages the Domain Name System (DNS) to perform the DID operations.
It is valued for its simplicity and ease of deployment compared to [[ref: DID methods]] that are
based on distributed ledgers or blockchain technology, but also comes with increased
challenges related to trust, security and verifiability. `did:web` provides a starting point for `did:webvh`,
which complements `did:web` with specific features to address its challenges
while still providing ease of deployment.

[[def: Entry Hash, entryHash, entry hashes]]

~ A `did:webvh` entry hash is a hash generated using a formally defined process
over the input data to a [[ref: log entry]], excluding the [[ref: Data Integrity]]
proof. The input data includes content from the predecessor to the
version of the DID, ensuring that all the versions are "chained" together in a
sort of microledger. The generated [[ref: entry hash]] is subsequently included in the
`versionId` of the [[ref: log entry]] and **MUST** be verified by a
resolver.

[[def: ISO8601, ISO8601 String]]

~ A date/time expressed using the [ISO8601
Standard](https://en.wikipedia.org/wiki/ISO_8601).

[[def: JSON Canonicalization Scheme]]

~ [[spec:rfc8785]] defines a method for canonicalizing a JSON
structure such that is suitable for verifiable hashing or signing.

[[def: JSON Lines, JSON Line]]

~ A file of JSON Lines, as described on the site
[https://jsonlines.org/](https://jsonlines.org/). In short, `JSONL` is lines of JSON with
whitespace removed and separated by a newline that is convenient for handling
streaming JSON data or log files.

[[def: Pre-Rotation, Key Pre-Rotation]]

~ A technique for a controller of a cryptographic key to commit to the public
key it will rotate to next, without exposing that actual public key. It protects
from an attacker that gains knowledge of the current private key from being
able to rotate to a new key known only to the attacker.

[[def: Linked-VP, Linked Verifiable Presentation]]

~ A [[spec:DID-CORE]] `service` entry that specifies where a [[ref: verifiable presentation]]
about the DID subject can be found. The [Decentralized Identity
Foundation](https://identity.foundation/) hosts the [Linked VP
Specification](https://identity.foundation/linked-vp/).

[[def: multibase]]

~ A specification for encoding binary data as a string using a prefix that
indicates the encoding.

[[def: multikey]]

~ A verification method that encodes key types into a single binary stream that
is then encoded as a [[ref: multibase]] value.

[[def: multihash]]

~ Per the [[spec:multiformats]], [[ref: multihash]] is a specification
for differentiating instances of hashes. Software creating a hash prefixes
(according to the specification) data to the hash indicating the algorithm used
and the length of the hash, so that software receiving the hash knows how to
verify it. Although [[ref: multihash]] supports many hash algorithms, for
interoperability, [[ref: DID Controllers]] **MUST** only use the hash algorithms defined
in this specification as permitted.

[[def: parameters, parameter]]

~ `did:webvh` parameters are a defined set of configurations that control how the
issuer has generated the DID, and how the resolver must process the DID [[ref:
Log entries]]. The use of parameters allows for the controlled evolution of
`did:webvh` log handling, such as evolving the set of permitted hash algorithms or
cryptosuites. This enables support for very long lasting identifiers -- decades.

[[def: self-certifying identifier, self-certifying identifiers, SCID, SCIDs]]

~ An object identifier derived from initial data such that an attacker could not
create a new object with the same identifier. The input for a `did:webvh` SCID is
the initial [[ref: DIDDoc]] with the placeholder `{SCID}` wherever the SCID is to be
placed.

[[def: Verifiable Credential, Verifiable Credentials]]

~ A verifiable credential can represent all of the same information that a physical credential represents, adding technologies such as digital signatures, to make the credentials more tamper-evident and so more trustworthy than their physical counterparts. The [Verifiable Credential Data Model](https://www.w3.org/TR/vc-data-model/) is a W3C Standard.

[[def: Verifiable Presentation, Verifiable Presentations]]

~ A [[ref: verifiable presentation]] data model is part W3C's [Verifiable Credential Data
Model](https://www.w3.org/TR/vc-data-model/) that contains a set of [[ref:
verifiable credentials]] about a `credentialSubject`, and a signature across the
verifiable credentials generated by that subject. In this specification, the use
case of primary interest is where the DID is the `credentialSubject` and the DID
signs the [[ref: verifiable presentation]].

[[def: watcher, watchers]]

~ Watchers are entities within a decentralized trust ecosystem that monitor Decentralized Identifiers (DIDs) for changes or updates on behalf of their clients. Watchers maintain a historical cache of DID document versions and verify that the [[ref: DID Controller]] is consistently following the prescribed evolution process. By ensuring integrity and traceability, watchers help foster trust among clients who rely on up-to-date and authentic DID information. `did:webvh` watchers provide endpoints for retrieving DID information and to receive [[ref: webhooks]] notifying the watcher about updates to the DID and deletion requests.

[[def: webhook, webhooks]]

~ A webhook is a mechanism that enables real-time communication between systems by sending HTTP callbacks (typically POST requests) to a specified URL when an event occurs. Webhooks are commonly used for event-driven integrations and automation. Although webhooks are an implementation pattern rather than a formal standard, best practices are documented in [[spec:rfc8030]].

[[def: witness, witnesses, witnessed]]

~ Witnesses are participants in the process of creating and verifying a version
of a `did:webvh` [[ref: DIDDoc]]. Notably, a witness receives from the [[ref: DID Controller]] a [[ref: DID
Log]] entry ready for publication, verifies it according to this specification,
and approves it according to its ecosystem governance (whatever that might be). If the verification and
approval process results are positive, witnesses returns to the DID Controller a [[ref: Data Integrity]] proof
attesting to that positive result.

[[def: threshold, witness threshold]]

~ An algorithm that defines when a sufficient number of [[ref: witnesses]] have
submitted valid [[ref: Data Integrity]] proofs for a [[ref: DID Log entry]] such
that it is approved and can be published. The algorithm details are in the
[Witness Threshold Algorithm](#witness-threshold-algorithm) section of this
specification.

[[def: W3C VCDM]]

~ A Verifiable Credential that uses the Data Model defined by the W3C [[spec: W3C-VC]] specification.

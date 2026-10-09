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
without its challenges — from trust layers inherited from the web and the
absence of a verifiable history for the DID.

Tackling these concerns, the `did:webvh` (`did:web` + Verifiable History) DID
Method enhances `did:web` with a [[ref: self-certifying identifier]] (SCID),
update keys and a verifiable history, akin to what is available with
ledger-based DIDs, but without relying on a ledger. The security of the
embedded [[ref: SCID]] does not depend on DNS: the domain name is used to find
the [[ref: DID Log]], not to verify it. For backwards compatibility, and for
verifiers that "trust" `did:web`, a `did:webvh` DID can be trivially modified
and published as a parallel `did:web` DID.

In `did:webvh` v1.0, the verifiable history mechanism was defined within the
DID method. That mechanism has since been extracted, generalised, and
published as the [[ref: VH-Log]] specification, so that it can be used for
other kinds of versioned objects, and by other DID methods, such as
[`did:vh`](https://swcurran.github.io/didvh/) [[spec:DID-VH]]. This version of `did:webvh`
uses VH-Log as its foundation. The intent is that a `did:webvh` v1.0 DID is
also a valid DID under this version; the [known
differences](#compatibility-with-didwebvh-v10) are listed in the
specification.

The following is a `tl;dr` summary of how `did:webvh` works:

1. `did:webvh` uses the same DID-to-HTTPS transformation as `did:web`, so
   `did:webvh`'s `did.jsonl` file is found in the same location as
   `did:web`'s `did.json` file, supporting an easy transition from `did:web`.
2. The `did.jsonl` file is the [[ref: DID Log]], a VH-Log log. It is a
   [[ref: JSON Lines]] file of [[ref: DID log entries]], each containing a
   `versionId`, `versionTime`, `parameters`, `state` (the [[ref: DIDDoc]]) and
   a [[ref: Data Integrity]] proof, as defined in [[ref: VH-Log]]. If
   [[ref: witnesses]] are used, their proofs are in a `did-witness.json` file
   in the same web location.
3. A [[ref: DID Controller]] creates the first [[ref: DID log entry]] as
   defined in [[ref: VH-Log]], using the DID string
   `did:webvh:{SCID}:<domain>[:<path>]` with the `{SCID}` placeholder,
   calculates the [[ref: SCID]], replaces the placeholders, and publishes the
   [[ref: DID Log]] at the web location given by the DID.
4. Updates append entries to the [[ref: DID Log]], each signed by an
   authorized key and, if [[ref: witnesses]] are used, approved by a threshold
   of them. If the DID has [[ref: watchers]], they are notified of each
   update.
5. Given a `did:webvh` DID, a [[ref: Resolver]] converts the DID to an HTTPS
   URL, retrieves the [[ref: DID Log]], verifies it with the [[ref: VH-Log]]
   algorithm and the `did:webvh`-specific checks defined here, and returns the
   requested version of the [[ref: DIDDoc]]. A client can also ask the
   [[ref: Resolver]] to check the [[ref: DID Log]] against copies held by
   [[ref: watchers]].
6. `did:webvh` DID URLs with paths and `/whois` are dereferenced to documents
   published by the [[ref: DID Controller]], by default in the web location
   relative to the `did.jsonl` file. See the [note below](#the-whois-use-case)
   about the powerful capability enabled by the `/whois` DID URL path.

An example of a `did:webvh` evolving through a series of versions can be seen
in the [`did:webvh` Examples](https://didwebvh.info/latest/example/) on the
`did:webvh` information site.

### The `/whois` Use Case

The `did:webvh` DID Method introduces what we hope will be a widely embraced convention for
all [[ref: DID Methods]] -- the `/whois` path. This feature harkens back to the `WHOIS`
protocol that was created in the 1970s (RFC 742) to provide a directory about
people and entities in the early days of ARPANET. In the 80's, `whois`
evolved through a series of RFCs (RFC 812, RFC 954) that expanded into the
[global whois](https://en.wikipedia.org/wiki/WHOIS) feature we know today as
[[spec-inform:rfc3912]]. Submit a `whois` request about a domain name, and get
back the information published about that domain.

We propose that the `/whois` path for a DID enable a comparable, decentralized,
version of the `WHOIS` protocol for DIDs. Notably, when `<did>/whois` is
dereferenced (using the [`#whois` service](#the-whois-service) to locate a
[[ref: Linked-VP]]), a [[ref: Verifiable Presentation]] (VP) may be returned (if
published by the [[ref: DID Controller]]) containing
[[spec:vc-recognized-entities-1.0]] Verifiable Credentials with the DID as the
`credentialSubject`, and the VP signed by the DID. Given a DID,
one can gather verifiable data about the [[ref: DID Controller]] by dereferencing
`<did>/whois` and processing the returned VP. That's powerful -- an efficient,
highly decentralized, trust registry. For `did:webvh`, the approach is very simple
-- transform the DID to its HTTPS equivalent, and execute a `GET <https>/whois`.
Need to know who issued the VCs in the VP? Get the issuer DIDs from those VCs,
and dereference `<issuer did>/whois` for each. This is comparable to walking a CA
(Certificate Authority) hierarchy, but self-managed by the [[ref: DID Controllers]] --
and the issuers that attest to them.

The following is a use case for the `/whois` capability. Consider an example of
the `did:webvh` controller being a mining company that has exported a shipment and
created a "Product Passport" Verifiable Credential with information about the
shipment. A country importing the shipment (the Importer) might want to know
more about the issuer of the VC, and hence, the details of the shipment. They
dereference the `<did>/whois` of the entity and get back a Verifiable Presentation
about that DID. It might contain:

- A verifiable credential issued by the Legal Entity Registrar for the
  jurisdiction in which the mining company is headquartered.
  - Since the Importer knows about the Legal Entity Registrar, they can automate
    this lookup to get more information about the company from the VC -- its
    legal name, when it was registered, contact information, etc.
- A verifiable credential for a "Mining Permit" issued by the mining authority
  for the jurisdiction in which the company operates.
  - Perhaps the Importer does not know about the mining authority for that
    jurisdiction. The Importer can repeat the `/whois` dereferencing process for
    the issuer of _that_ credential. The Importer might (for example), resolve
    and verify the `did:webvh` DID for the Authority, and then dereference the
    `/whois` DID URL to find a verifiable credential issued by the government of
    the jurisdiction. The Importer recognizes and trusts that government's
    authority, and so can decide to recognize and trust the mining permit
    authority.
- A verifiable credential about the auditing of the mining practices of the
  mining company. Again, the Importer doesn't know about the issuer of the audit
  VC, so they dereference the `/whois` for the DID of the issuer, get its VP and
  find that it is accredited to audit mining companies by the [London Metal
  Exchange](https://www.lme.com/en/) according to one of its mining standards.
  As the Importer knows about both the London Metal Exchange and the standard,
  it can make a trust decision about the original Product Passport Verifiable
  Credential.

Such checks can all be done with a handful of HTTPS requests and the processing
of the DIDs and verifiable presentations. If the system cannot automatically
make a trust decision, lots of information has been quickly collected that can
be passed to a person to make such a decision.

The result is an efficient, verifiable, credential-based, decentralized,
multi-domain trust registry, empowering individuals and organizations to verify
the authenticity and legitimacy of DIDs. The convention promotes a decentralized
trust model where trust is established through cryptographic verification rather
than reliance on centralized authorities. By enabling anyone to access and
validate the information associated with a DID, the "/whois" path contributes to
the overall security and integrity of decentralized networks.

## Abstract

This `did:webvh` AnonCreds Method specification defines how [[spec: AnonCreds]] objects should be registered (written) and resolved when rooting them in a `did:webvh` DID. This specification parallels other DID-specific AnonCreds methods that are registered in the [AnonCreds Methods Registry].

[AnonCreds Methods Registry]: https://hyperledger.github.io/anoncreds-methods-registry/

The specification introduces the concept of an [[ref: Attested Resource]] that enables verifiable identifiers that resolve to resources (files) managed by a `did:webvh` Controller. We anticipate later extracting the [[ref: Attested Resources]] concept into a separate specification on its own. Each of the published AnonCreds objects ([[ref: schema]], [[ref: CredDef]], [[ref: RevRegDef]], and [[ref: RevRegEntry]] are treated as [[ref: Attested Resources]] in this AnonCreds method.

For information beyond this `did:webvh` AnonCreds Method specification, the (`did:webvh`) DID method, and how (and
where) it is used in practice, please visit [https://didwebvh.info/](https://didwebvh.info/).

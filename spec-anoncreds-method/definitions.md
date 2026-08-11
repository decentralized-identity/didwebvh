## Definitions

[[def: Schema, AnonCreds Schema, Schemas, AnonCreds Schemas]]

~ A JSON object that defines the schema for an AnonCreds verifiable credential. A schema for a given verifiable credential type rooted to a `did:webvh` DID can be resolved as an [[ref: Attested Resource]] associated with that DID. The AnonCreds schema is defined in the [Schema publishing section](https://hyperledger.github.io/anoncreds-spec/#schema-publisher-publish-schema-object) of the [[spec: AnonCreds]] specification.

[[def: CredDef, AnonCreds CredDef, CredDefs, AnonCreds CredDefs]]

~ A JSON object that contains the public keys that enables verification of an an AnonCreds verifiable presentation derived from a verifiable credential from a specific Issuer. A CredDef for a given verifiable credential type rooted to a `did:webvh` DID can be resolved as an [[ref: Attested Resource]] associated with that DID. An AnonCreds CredDef object is defined in the [CredDef generation section](https://hyperledger.github.io/anoncreds-spec/#generating-a-credential-definition-without-revocation-support) of the [[spec: AnonCreds]] specification.

[[def: RevRegDef, AnonCreds RevRegDef, RevRegDefs, AnonCreds RevRegDefs]]

~ A JSON object that contains the metadata and public key published by the Issuer that enables verification of an AnonCreds [non-revocation proof](https://hyperledger.github.io/anoncreds-spec/#collecting-data-for-generating-the-non-revocation-proof) that a holder includes in a presentation of a revocable credential. A RevRegDef for a given [[ref: AnonCreds CredDef]] rooted to a `did:webvh` DID can be resolved as an [[ref: Attested Resource]] associated with that DID. An AnonCreds RevRegDef object is defined in the [RevRegDef creation section](https://hyperledger.github.io/anoncreds-spec/#issuer-create-and-publish-revocation-registry-objects) of the [[spec: AnonCreds]] specification.

[[def: RevRegEntry, AnonCreds RevRegEntry, RevRegEntries, AnonCreds RevRegEntries]]

~ A JSON object that contains the accumulator and current state (revoked or not) of all credentials within an AnonCreds revocation registry. The RevRegEntry data is used by the Holder to create a [non-revocation proof](https://hyperledger.github.io/anoncreds-spec/#collecting-data-for-generating-the-non-revocation-proof). A verifier must get the accumulator from the same RevRegEntry used by the holder to verify the non-revocation proof. A RevRegEntry for a given [[ref: AnonCreds RevRegDef]] rooted to a `did:webvh` DID can be resolved as an [[ref: Attested Resource]] associated with that DID. An AnonCreds RevRegEntry object is defined in the [RevRegEntry creation section](https://hyperledger.github.io/anoncreds-spec/#creating-the-initial-revocation-status-list-object) of the [[spec: AnonCreds]] specification.

[[def: Attested Resource, Attested Resources, attestedResource]]

~ A JSON object, published as a resource associated with a `did:webvh` DID. The resolvable identifier for the resource includes the hash of the resource, and there is a Data Integrity proof signed by the DID Controller attached to the JSON object that includes the resource. The hash and proof are used to verify that the resolved resource has not been altered, and was published by the DID Controller.

[[def: Data Integrity]]

~ [W3C Data
Integrity](https://www.w3.org/community/reports/credentials/CG-FINAL-data-integrity-20220722/)
is a specification of mechanisms for ensuring the authenticity and integrity of
structured digital documents using cryptography, such as digital signatures and
other digital mathematical proofs.

[[def: DID Controller, DID Controller's, DID Controllers]]

~ The entity that controls (create, updates, deletes) a given DID, as defined
in the [[spec:DID-CORE]].

## `did:webvh` Version Changelog

The following lists the substantive changes in each version of the specification.

- Version 0.5
  - Remove the `prerotation` parameter. The feature is automatically enforced
    when `nextKeyHashes` is present.
  - Clarify the way the [[ref: Pre-Rotation]] feature works, once a `nextKeyHashes`
    is committed, the next [[ref: DID log entries]] has to be signed by one of the committed keys.
  - Clarify how to stop using [[ref: pre-rotation]], including when deactivating the DID.
  - Change the [[ref: witness]] handling by removing the witness [[ref: Data Integrity]]
    proofs from the [[ref: DID Log]] file and puts them into a separate file
    `did-witness.json`. Adjustments to the witness threshold algorithm were also
    made, such as removing the [[ref: DID Controllers]]' `selfweight` attribute,
    and defining that all witness DIDs must be `did:key` DIDs.
  - Clarify how to stop using witnesses.
  - Clarify the initialization values of [[ref: parameters]] and that array
    [[ref: parameters]] must use `null` and **not** use empty lists (`[]`) when
    not active.
  - Rename the DID Method to `did:webvh` (`did:web` + Verifiable History)
  - Move the DID Method information site to [https://didwebvh.info](https://didwebvh.info).
- Version 0.4
  - Removes large non-normative sections, such as the implementer's guide, as they are now published on the [https://didtdw.org/](https://didtdw.org/) information site.
  - Removes the use of JSON Patch from the specification. The full DIDDoc is included in each [[ref: DID log entry]].
  - Changes the data format of the [[ref: DID log entries]] from an array to an object. The [[ref: DID Log]] remains in the [[ref: JSON Lines]] format.
  - Changes the [[ref: DID log entry]] array to be named JSON objects or properties.
  - Makes each DID version's [[ref: Data Integrity]] proof apply across the JSON
    [[ref: DID log entry]] object, as is typical with [[ref: Data Integrity]] proofs.
    Previously, the [[ref: Data Integrity]] proof was generated across
    the current DIDDoc version, with the `versionId` as the challenge.
  - Specified that the `versionTime` must be recorded as a UTC time zone timestamp.
- Version 0.3
  - Removes the `cryptosuite` [[ref: parameter]], moving it to implied based on the `method` [[ref: parameter]].
  - Change base32 encoding with [[ref: base58btc]], as it offers a better expansion rate.
  - Remove the step to extract part of the [[ref: base58btc]] result during the generation of the [[ref: SCID]].
  - Use [[ref: multihash]] in the [[ref: SCID]] to differentiate the different hash function outputs.
- Version 0.2
  - Changes the location of the [[ref: SCID]] in the DID to always be the first
    component after the DID Method prefix -- `did:tdw:<scid>:...`.
  - Adds the [[ref: parameter]] `portable` to enable the capability to move a
    `did:tdw` during the creation of the DID.
  - Removes the first two [[ref: Log Entry]] items `entryHash` and `versionId`
    and replacing them with the new `versionId` as the first item in each
    [[ref: log entry]]. The new versionId takes the form `<version number>-<entryHash>`,
    where `<version number>` is the incrementing integer of version of the
    entry: 1, 2, 3, etc.
  - The `<did>/whois` media type is changed to `application/vp` and the file is
    changed to `whois.vp` to match the IANA registration of a [[ref: Verifiable Presentation]].

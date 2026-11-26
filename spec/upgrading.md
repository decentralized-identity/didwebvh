## Upgrading a DID

A `did:webvh` DID is created under one version of this specification and can
be upgraded to later versions over its lifetime, without changing its
[[ref: SCID]] or losing its verifiable history. This section defines the
general process for upgrading a DID, followed by a subsection for each
supported upgrade that lists what changes between the two versions.

**Upgrading.** To upgrade a DID, the [[ref: DID Controller]] carries out the
[Update](#update-rotate) process to publish a new [[ref: log entry]] (the
*upgrading entry*) whose `parameters` set the `method` [[ref: parameter]] to
the value for the target version. The following rules apply:

1. The target version **MUST** be later than the currently active version.
   A [[ref: log entry]] that sets `method` to a lower version than the
   currently active version **MUST NOT** be published by the
   [[ref: DID Controller]], and **MUST** be rejected by resolvers.
2. The upgrading entry, and every subsequent [[ref: log entry]], **MUST**
   conform to the target version, and **MUST** be generated and verified
   using the rules of the target version. This includes the upgrading entry's
   [[ref: parameters]], [[ref: DIDDoc]] (`state`), `versionId` and
   `entryHash`, and [[ref: Data Integrity]] proof, and, if
   [[ref: witnesses]] are active, its witness proofs.
3. Before upgrading, the [[ref: DID Controller]] **MUST** ensure that the
   keys authorized to sign the upgrading entry (see [Authorized
   Keys](#authorized-keys)) and, if [[ref: witnesses]] are active, the
   witness keys, are permitted by the target version. Where they are not,
   the [[ref: DID Controller]] **MUST** first rotate to permitted keys in
   one or more [[ref: log entries]] under the currently active version.
4. Any [[ref: parameter]] introduced by the target version and not set in the
   upgrading entry takes the default value defined by the target version.
5. The [[ref: DIDDoc]] in the upgrading entry **MUST** include any changes
   that the target version requires of a [[ref: DIDDoc]], and **SHOULD**
   include any changes needed to keep the behaviour the
   [[ref: DID Controller]] wants, as listed for that upgrade below.
6. A [[ref: DID Controller]] **MAY** upgrade directly to any later version
   that this specification defines. When doing so, the upgrading entry
   **MUST** account for the changes of each intervening upgrade.

**Resolving an upgraded DID.** A resolver processes each [[ref: log entry]]
according to the version identified by the `method` [[ref: parameter]]
active for that entry, as described in [Read (Resolve)](#read-resolve).
[[ref: Log entries]] published before the upgrading entry continue to be
processed under the earlier version. When a resolution request selects a
[[ref: DIDDoc]] version published before the upgrading entry (for example,
using the `versionId`, `versionTime` or `versionNumber` resolution options),
the resolver **MUST** produce that [[ref: DIDDoc]] according to the rules of
the version active for that [[ref: log entry]]. Because every
[[ref: log entry]] has to be verified, a resolver that does not support the
version active for any [[ref: log entry]] in a [[ref: DID Log]] cannot
verify the log, and **MUST** terminate resolution of the DID.

### Upgrading from v1.0 to v2.0

This section lists the changes from [v1.0](../v1.0) to v2.0 of this
specification that affect a DID being upgraded, and what a
[[ref: DID Controller]] needs to do about each. Other changes made in v2.0
are listed in the [Version Changelog](#didwebvh-version-changelog).

**DIDs that cannot be upgraded.** A v1.0 DID cannot be upgraded to v2.0, and
remains a v1.0 DID, if any of the following applies:

- Its domain name contains U-labels and `portable` is not `true`. See item 5
  (Internationalized domain names) below.
- Updates have been stopped: the `updateKeys` in effect is `[]` and
  [[ref: pre-rotation]] is not active, so no key can sign the upgrading
  entry. See item 2 (Required pre-rotation) below.
- It has been deactivated, so no entry can follow the deactivating entry. See
  [Deactivate (Revoke)](#deactivate-revoke).

A v1.0 DID whose `nextKeyHashes` commits only to keys already revealed in
`updateKeys` can be upgraded, but only after an additional v1.0 entry, as
described in item 2.

1. **`method` value.** The upgrading entry **MUST** set the `method`
   [[ref: parameter]] to `did:webvh:2.0`. No change to the permitted hash
   algorithm or [[ref: Data Integrity]] cryptosuite is made in v2.0, so no
   key rotation is needed to meet the algorithm requirements of rule 3
   above. Which keys can sign the upgrading entry is defined in the next
   item.

2. **Required pre-rotation.** In v1.0, the keys authorized to sign entries
   are listed in `updateKeys`, which can appear in any entry, and
   [[ref: pre-rotation]] is optional, using the `nextKeyHashes`
   [[ref: parameter]]. v2.0 requires pre-rotation: `updateKeys` appears only
   in the first entry, `nextKeyHashes` is replaced by `prerotationHashes`, and
   every entry commits in `prerotationHashes` to the keys that can sign the
   next entry, as defined in [Authorized Keys](#authorized-keys). Because the
   entry before the upgrading entry is a v1.0 entry, the keys authorized to
   sign the upgrading entry are determined from the v1.0
   [[ref: parameters]] in effect before it, as follows.
   - The upgrading entry **MUST** include `prerotationHashes`, committing to
     the keys that can sign the next entry, and **MUST NOT** include
     `updateKeys` or `nextKeyHashes`.
   - **Pre-rotation not active under v1.0.** If the `nextKeyHashes` in
     effect before the upgrading entry is empty, the upgrading entry **MUST**
     be signed by a key in the `updateKeys` in effect before it — the same
     key that could sign the entry under v1.0. For the upgrading entry, that
     `updateKeys` plays the role that the first entry's `updateKeys` plays in
     v2.0. If it is `[]`, no entry can follow it, and the DID cannot be
     upgraded.
   - **Pre-rotation active under v1.0.** If the `nextKeyHashes` in effect
     before the upgrading entry is non-empty, it is treated as the previous
     entry's `prerotationHashes`: the upgrading entry **MUST** be signed by a
     key whose hash, calculated as defined in [Pre-Rotation Key Hash
     Generation and
     Verification](#pre-rotation-key-hash-generation-and-verification), is in
     it. Under v1.0, that key would be listed in the entry's `updateKeys`;
     under v2.0, it is not listed, and is identified only by the proof's
     `verificationMethod`.
   - **Used keys.** Every key in the `updateKeys` of any v1.0 entry is a
     [[ref: used key]], and cannot sign the upgrading entry or any later
     entry, with one exception: when pre-rotation is not active under v1.0, a
     key in the `updateKeys` in effect before the upgrading entry can sign
     the upgrading entry. The key that signs the upgrading entry is then a
     used key as well.
   - v1.0 permits, but discourages, committing in `nextKeyHashes` to a key
     that has already been revealed in `updateKeys`. A
     [[ref: DID Controller]] whose `nextKeyHashes` commits only to such keys
     **MUST**, before upgrading, publish a v1.0 entry whose `nextKeyHashes`
     commits to keys not yet revealed.
   - Every entry after the upgrading entry is signed as defined in
     [Authorized Keys](#authorized-keys).

3. **Implicit services removed.** Under v1.0, resolvers add two implicit
   services, `#files` and `#whois`, to every resolved [[ref: DIDDoc]] that
   does not define them, so that `<did>/path/to/file` and `<did>/whois` DID
   URLs are dereferenced to locations relative to the [[ref: DID Log]]. In
   v2.0, resolvers add no services: the resolved [[ref: DIDDoc]] contains
   exactly the services in the `state` of the [[ref: log entry]].
   - After the upgrade, `<did>/whois` and other DID URL paths resolve only
     if the [[ref: DIDDoc]] includes explicit services for them. A
     [[ref: DID Controller]] that relies on those paths needs to add the
     services in the upgrading entry. The
     [Common DID URL Path Services](#common-did-url-path-services) section
     describes services equivalent to the v1.0 implicit services.
   - A [[ref: DID Controller]] that publishes a [parallel `did:web`
     DID](#publishing-a-parallel-didweb-did) no longer adds the implicit
     services to the `did:web` [[ref: DIDDoc]]; it contains the same
     services as the `did:webvh` [[ref: DIDDoc]].
   - Resolving a [[ref: DIDDoc]] version published before the upgrading
     entry still returns the v1.0 implicit services, as required in
     [Resolving an upgraded DID](#upgrading-a-did) above.

4. **DID URL path handling.** The implicit services defined in v1.0 were based
   on DID URL path handling that is not aligned with the latest DID URL
   dereferencing algorithm, and in particular the `PathHandler` part of that
   algorithm in the current DID Resolution specification
   [[spec:DID-RESOLUTION]]. [[ref: DID Controllers]] that defined explicit
   services matching the implicit service definitions in order to change the
   location of the DID URL resources are advised to review the
   [Common DID URL Path Services](#common-did-url-path-services) section and update their
   services accordingly.

5. **Internationalized domain names.** v1.0 permits a domain name in the DID
   to contain Unicode characters (percent-encoded U-labels), which resolvers
   convert during the DID-to-HTTPS transformation. v2.0 requires the domain
   name to be ASCII, with non-ASCII labels written as A-labels, as defined in
   [International Domain Names](#international-domain-names) and [Case
   Sensitivity and Normalization](#case-sensitivity-and-normalization).
   - A DID whose domain name is ASCII is not affected.
   - A DID whose domain name contains U-labels cannot keep that DID string
     under v2.0, because the `state.id` of the upgrading entry has to conform
     to v2.0. If the DID has `portable` set to `true`, the
     [[ref: DID Controller]] **MAY** upgrade it by also renaming the DID in
     the upgrading entry to the equivalent A-label form, following [DID
     Portability](#did-portability) (including adding the prior DID to
     `alsoKnownAs`). Both forms transform to the same HTTPS URL, so the
     [[ref: DID Log]] does not move. If the DID is not portable, it cannot be
     upgraded to v2.0 and remains a v1.0 DID.
   - A resolver that supports v1.0 **SHOULD** accept a DID that conforms to
     the v1.0 method-specific identifier rules but not to those of v2.0,
     applying the v1.0 DID-to-HTTPS transformation to retrieve its
     [[ref: DID Log]]. Every [[ref: log entry]] whose `state.id` is such a
     DID **MUST** have a v1.0 `method` active.

6. **Log entry schema.** [[ref: Log entries]] from the upgrading entry
   onward can be validated against the v2.0 [log entry
   schema](https://raw.githubusercontent.com/decentralized-identity/didwebvh/refs/heads/main/schemas/v2.0/log_entry.json).
